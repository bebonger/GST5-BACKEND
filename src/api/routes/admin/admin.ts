import Router from "@koa/router";
import { ParameterizedContext } from "koa";
import { isHeadStaff, isLoggedInDiscord } from "../../../middleware";
import { Match } from "../../../Models/bracket";
import { OsuUser } from "../../../Models/user";
import axios from "axios";
import { osuV2Client } from "../../../osu";

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
  

export default adminRouter;