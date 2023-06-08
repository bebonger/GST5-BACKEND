import Router from "@koa/router";
import { IsEligibleToPlay, isLoggedIn } from "../../../middleware"
import { ParameterizedContext } from "koa";
import { Invite, Team } from "../../../Models/team";
import { OsuUser } from "../../../Models/user";
import { config } from 'node-config-ts';
import axios from "axios";
import imgurClient from '../../../ConfigScripts/imgurConfig';
import { createReadStream, readFile, readFileSync, unlink } from "fs";
import { promisify } from "util";
import { File } from "buffer";

const teamsRouter = new Router();

teamsRouter.get("/", async (ctx: ParameterizedContext<any>, next) => {
    const teams = await Team.find({
        relations: ['player1', 'player2']
    });

    const promises = teams.map(async team => {
        return team.getInfo();
    });
    
    const teamInfoArray = await Promise.all(promises);
    console.log(teamInfoArray);
    ctx.body = teamInfoArray;
});

teamsRouter.post("/edit/banner", isLoggedIn, async (ctx: ParameterizedContext<any>, next) => {

    const file = ctx.request.files.image;
    const fileStream = createReadStream(file["filepath"]);


    const buffer = await new Promise((resolve, reject) => {
        const chunks = [];
        fileStream.on('data', (chunk) => {
            chunks.push(chunk);
        });
        
        fileStream.on('end', () => {
            resolve(Buffer.concat(chunks));
        });
        
        fileStream.on('error', (error) => {
            reject(error);
        });
    });
    
    const response = await imgurClient.upload({
        image: buffer as Buffer,
        type: 'stream'
    })

    console.log(response.data);
    
    await unlink(file['filepath'], (err) => {
        if (err) {
            console.error(`Error deleting temporary file ${file['filepath']}:`, err);
        }
    });

    const team = await Team.findOne({
        where: [
            { player1: { userID: ctx.session.userID } },
            { player2: { userID: ctx.session.userID } },
        ],
        relations: ['player1', 'player2'],
    });

    if (!team) {
        console.log("No team found");
        ctx.body = {
            error: "No team found"
        }
        return;
    } 

    team.team_avatar = response.data.link;
    await team.save();

    ctx.body = {
        success: "Changed team banner"
    }
});

teamsRouter.post("/edit/name", isLoggedIn, async (ctx: ParameterizedContext<any>, next) => {

    if ((ctx.request.body.name as string).trim().length == 0 || (ctx.request.body.name as string).length >= 16) {
        ctx.body = {
            error: "Invalid Team Name"
        };
        return;
    }
    
    const team = await Team.findOne({
        where: [
            { player1: { userID: ctx.session.userID } },
            { player2: { userID: ctx.session.userID } },
        ],
        relations: ['player1', 'player2'],
    });

    if (!team) {
        ctx.body = {
            error: "No team found"
        };
        return;
    } 


    let oldName = team.team_name;
    team.team_name = ctx.request.body.name;
    await team.save();

    ctx.body = {
        success: `Changed team name from ${oldName} to ${team.team_name}`
    };
});

teamsRouter.get("/invites", async (ctx: ParameterizedContext<any>, next) => {

    if (!ctx.isAuthenticated || !ctx.session.userID) {
        ctx.body = { error: "Your session has expired, please log in again." }; 
        return;
    }

    const invites = await Invite.find({
        where: {
            invitee: { 
                userID: ctx.session.userID
            }
        },
        relations: [ "sender", "invitee" ]
    });

    console.log(invites); 

    const promises = invites.map(async invite => {
        return invite.getInfo();
    });
    
    const inviteInfoArray = await Promise.all(promises);
    console.log(inviteInfoArray);
    ctx.body = inviteInfoArray;
});

teamsRouter.post("/invites/send", isLoggedIn, async (ctx: ParameterizedContext<any>, next) => {

    if (!ctx.request.body["invitee"] || ctx.request.body["invitee"] === "") {
        ctx.body = { error: "User does not exist" }; 
        return;
    }

    // Check if user is in team
    const team = await Team.findOne({
        where: [
            { player1: { userID: ctx.session.userID }},
            { player2: { userID: ctx.session.userID }},
        ]
    });

    if (team) {
        ctx.body = { error: "You already have a team" }; 
        return;
    }

    const [sender, invitee] = await Promise.all([
        OsuUser.findOne({where: { userID: ctx.session.userID }, relations: ["discord"]}),
        OsuUser.findOne({where: { userID: ctx.request.body["invitee"] }, relations: ["discord"]})
    ]);

    if (!sender) {
        ctx.body = { error: "Invalid sender." };
        return;
    }

    if (!invitee) {
        ctx.body = { error: "User does not exist." };
        return;
    }

    if (invitee.is_restricted || (await invitee.getInfo()).staff.headStaff || invitee.userID == ctx.session.userID) {
        ctx.body = { error: "You cannot invite this player." };
        return;
    }

    // Search for existing invite towards this player
    let invite = await Invite.findOne({
        where: {
            sender: { userID: ctx.session.userID },
            invitee: { userID: Number(ctx.request.body["invitee"]) }
        },
        relations: [ "sender", "invitee" ]
    });

    if (invite) {
        ctx.body = { error: 'You have already invited this player.' };
        return;
    }

    invite = new Invite;
    invite.sender = sender;
    invite.invitee = invitee;

    invite.save();
    ctx.body = { success: `You have invited '${invite.invitee.username}'!` };
});

teamsRouter.post("/invites/accept", async (ctx: ParameterizedContext<any>, next) => { 
    if (!ctx.isAuthenticated || !ctx.session.userID) {
        ctx.body = { error: "Your session has expired, please log in again." }; 
        return;
    }

    // Check if user is in team
    const team = await Team.findOne({
        where: [
            { player1: { userID: ctx.session.userID }},
            { player2: { userID: ctx.session.userID }},
        ]
    });

    if (team) {
        ctx.body = { error: "You already have a team" }; 
        return;
    }

    try {
        const invite = await Invite.findOne({
            where: {
                sender: { userID: ctx.request.body["invite"]["sender"] },
                invitee: { userID:  ctx.session.userID }
            },
            relations: [ "sender", "invitee" ]
        })

        if (!invite) {
            ctx.body = { "error": "Invalid invite" };
            return;
        }
 
        let players = await OsuUser.find({
            where : [
                { userID: ctx.request.body["invite"]["sender"]},
                { userID: ctx.session.userID }
            ]
        });

        const team = new Team;
        team.team_name = "Team " + Math.floor(Math.random() * 9000 + 1000);
        team.player1 = players[0];
        team.player2 = players[1];
        
        await invite.remove();
        await team.save();

        ctx.body = { "success": `You have formed a team with '${invite.sender.username}'.`}

    } catch (err) {
        ctx.body = { "error": "Error while accepting invite: " + err };
        console.log(err);
    }
});


teamsRouter.post("/invites/decline", isLoggedIn, async (ctx: ParameterizedContext<any>, next) => { 
    try {
        const invite = await Invite.findOne({
            where: {
                sender: { userID: ctx.request.body["invite"]["sender"] },
                invitee: { userID:  ctx.session.userID }
            },
            relations: [ "sender", "invitee" ]
        })

        if (!invite) {
            ctx.body = { "error": "Invalid invite" };
            return;
        }
        
        await invite.remove();
        ctx.body = { "success": `You have declined an invite from '${invite.sender.username}'.`}

    } catch (err) {
        ctx.body = { "error": "Error while declining invite: " + err };
        console.log(err);
    }

});

export default teamsRouter;