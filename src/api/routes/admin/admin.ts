import Router from "@koa/router";
import { ParameterizedContext } from "koa";
import { isHeadStaff, isLoggedInDiscord } from "../../../middleware";
import { Match } from "../../../Models/bracket";
import { OsuUser } from "../../../Models/user";
import axios from "axios";
import { osuV2Client } from "../../../osu";
import { PoolMap } from "../../../Models/mappool";
import { PoolMod } from "../../../Interfaces/mappool";
import { MatchStage } from "../../../Interfaces/bracket";
import { Team } from "../../../Models/team";

const adminRouter = new Router();

adminRouter.use(isLoggedInDiscord);
adminRouter.use(isHeadStaff);


async function delayExecution(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

adminRouter.post("/user/refresh", async (ctx: ParameterizedContext<any>, next) => {
    // 1: Retrieve all users from postgres
    const users = await OsuUser.find();
    let userIds = [];
    
    users.forEach(user => {
        userIds.push(user.userID);
    });

    try {
        // 2: Fetch all users from osu api
        let result = {};
        for (const id of userIds) {
            await delayExecution(8.3); // Delay execution by 500ms
            console.log("Fetching userId: " + id);
            result[id] = await osuV2Client.getUser(id, ctx.state.accessToken);
            console.log(`${result[id].username}: Rank ${result[id].statistics.global_rank}, ${result[id].statistics.pp}pp`);
        }

        // 3: Update all users in postgres with new data
        users.forEach(user => {
            user.username = result[user.userID].username;
            user.avatar = result[user.userID].avatar_url;
            user.global_rank = result[user.userID].statistics.global_rank,
            user.country_rank = result[user.userID].statistics.country_rank,
            user.performance_points = result[user.userID].statistics.pp;
            user.badges = result[user.userID].badges.length;
            user.is_restricted = result[user.userID].is_restricted;
            user.country_code = result[user.userID].country_code;

            user.save();
        });

        ctx.body = { "success": "User data has been refreshed"};
    } catch(e) {
        ctx.body = { "error": e.message };
    }
});

adminRouter.post("/mappool/insert", async (ctx: ParameterizedContext<any>, next) => {

    console.log(ctx.request.body);

    if (!ctx.request.body["id"] || !Number.isInteger(ctx.request.body["id"]) || !ctx.request.body["mod"] || !ctx.request.body["stage"] || !ctx.request.body["slot"] || !Number.isInteger(ctx.request.body["slot"])) {
        ctx.body = { error: "Invalid parameters" };
        return;
    }

    const mods = {
        "NM": 1,
        "EZ": 2,
        "HD": 8,
        "HR": 16,
        "SD": 32,
        "DT": 64,
        "RL": 128,
        "HT": 256,
        "NC": 512,
        "FL": 1024,
    };

    // Fetch map from osu database
    const beatmap = await osuV2Client.getBeatmap(ctx.request.body["id"], ctx.state.accessToken);
    const attributes = await osuV2Client.getBeatmapAttributes(ctx.request.body["id"], { "mods": mods[ctx.request.body["mod"]] }, ctx.state.accessToken);
    console.log(attributes);
    if (!beatmap || !attributes) {
        ctx.body = { error: "Error retrieving beatmap" };
        return;
    }
 
    let url = beatmap.url;
    let cover = beatmap.beatmapset.covers.cover;
    let artist = beatmap.beatmapset.artist;
    let title = beatmap.beatmapset.title;
    let difficulty = beatmap.version;
    let mapper = beatmap.beatmapset.creator;

    let length = (ctx.request.body["mod"] == "DT") ? beatmap.total_length * 1.5 : beatmap.total_length;
    let ar = Number(attributes.attributes.approach_rate.toFixed(1));
    let od = Number(attributes.attributes.overall_difficulty.toFixed(1));
    let cs = (ctx.request.body["mod"] == "HR") ? (beatmap.cs*1.3>10 ? 10 : Number((beatmap.cs*1.3).toFixed(1))) : beatmap.cs;
    let bpm = (ctx.request.body["mod"] == "DT") ? Math.round(beatmap.bpm*1.5) : beatmap.bpm;
    let hp = beatmap.drain;
    let star_rating =  Number(attributes.attributes.star_rating.toFixed(2));

    let map = await PoolMap.findOne({
        where: {
            stage: ctx.request.body["stage"] as MatchStage,
            mod: ctx.request.body["mod"] as PoolMod,
            slot: Number(ctx.request.body["slot"])
        }
    });

    if (!map) {
        map = new PoolMap;
    }

    map.stage = ctx.request.body["stage"] as MatchStage;
    map.mod = ctx.request.body["mod"] as PoolMod;
    map.slot = Number(ctx.request.body["slot"]);

    map.mapID = Number(ctx.request.body["id"]);
    map.url = url;
    map.cover = cover;
    map.artist = artist;
    map.title = title;
    map.difficulty = difficulty;
    map.mapper = mapper;

    map.length = length;
    map.AR = ar;
    map.OD = od;
    map.CS = cs;
    map.BPM = bpm;
    map.HP = hp;
    map.star_rating = star_rating;
    map.ez_mult = ctx.request.body["ez_mult"] ? Number(ctx.request.body["ez_mult"]) : null;

    await map.save();
    ctx.body = { success: `Added '${map.artist} - ${map.title} [${map.difficulty}] as ${map.stage} ${map.mod}${map.slot}'` };

});
  
adminRouter.post("/mappool/remove", async (ctx: ParameterizedContext<any>, next) => {
    console.log(ctx.request.body);

    const map = await PoolMap.findOne({
        where: {
            stage: ctx.request.body["stage"],
            mod: ctx.request.body["mod"],
            slot: Number(ctx.request.body["slot"])
        }
    });

    if (!map) {
        ctx.body = { error: "No map found" };
        return;
    }

    await map.remove();
    ctx.body = { success: `Removed '${map.artist} - ${map.title} [${map.difficulty}] from ${map.stage} ${map.mod}${map.slot}'` }
});

adminRouter.post("/match/insert", async (ctx: ParameterizedContext<any>, next) => {
    if (!ctx.request.body["id"] || !ctx.request.body["stage"] || !ctx.request.body["team1"] || !ctx.request.body["team2"]) {
        ctx.body = { error: "Invalid parameters" };
        return;
    }

    const teams = await Team.find({
        where: [
          { team_name: ctx.request.body["team1"] },
          { team_name: ctx.request.body["team2"] },
        ]
    });

    if (teams.length != 2) {
        ctx.body = { error: "One or more teams not found" };
        return;
    }

    let match = await Match.findOne({
        where: {
            matchID: ctx.request.body["id"]
        }
    });

    if (match) {
        ctx.body = { error: `Match ${ctx.request.body["id"]} already exists`};
        return;
    }

    match = new Match;
    match.matchID = ctx.request.body["id"];
    match.stage = ctx.request.body["stage"] as MatchStage;
    match.redTeam = teams.find(x => x.team_name == ctx.request.body["team1"]);
    match.blueTeam = teams.find(x => x.team_name == ctx.request.body["team2"]);

    await match.save();
    ctx.body = { success: `Match ${ctx.request.body["id"]} created` }
});

adminRouter.post("/match/remove", async (ctx: ParameterizedContext<any>, next) => {

    if (!ctx.request.body["id"]) {
        ctx.body = { error: "Invalid parameters" };
        return;
    }

    let match = await Match.findOne({
        where: {
            matchID: ctx.request.body["id"]
        }
    });

    if (!match) {
        ctx.body = { error: `No match found`};
        return;
    }

    await match.remove();
    ctx.body = { success: `Match ${ctx.request.body["id"]} removed` };

});

adminRouter.post("/match/edit", async (ctx: ParameterizedContext<any>, next) => {

    if (!ctx.request.body["id"]) {
        ctx.body = { error: "Invalid parameters" };
        return;
    }

    let match = await Match.findOne({
        where: {
            matchID: ctx.request.body["id"]
        }
    });

    if (!match) {
        ctx.body = { error: `No match found`};
        return;
    }

    if (ctx.request.body["date"] && ctx.request.body["time"]) {
        match.schedule_date = ctx.request.body["date"];
        match.schedule_time = ctx.request.body["time"]
    }

    if (ctx.request.body["mp_link"]) match.mp_link = ctx.request.body["mp_link"];

    await match.save();
    ctx.body = { success: `Match ${ctx.request.body["id"]} updated` };

});

export default adminRouter;