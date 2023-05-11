import Router from "@koa/router";
import { IsEligibleToPlay } from "../../../middleware"
import { ParameterizedContext } from "koa";
import { Invite, Team } from "../../../Models/team";
import { OsuUser } from "../../../Models/user";

const teamsRouter = new Router();

teamsRouter.get("/", async (ctx: ParameterizedContext<any>, next) => {
    const teams = await Team.find({
        relations: ['player1', 'player2']
    });
    ctx.body = teams;
});

teamsRouter.post("/send-invite", async (ctx: ParameterizedContext<any>, next) => {
    
    if (!ctx.isAuthenticated || !ctx.session.userID) {
        ctx.body = { error: "Your session has expired, please log in again." }; 
        return;
    }

    if (!ctx.request.body["invitee"] || ctx.request.body["invitee"] === "") {
        ctx.body = { error: "You cannot invite this player." }; 
        return;
    }

    // Search for existing invite towards this player
    let invite = await Invite.findOne({
        where: {
            sender: ctx.session.userID,
            invitee: Number(ctx.request.body["invitee"])
        }
    });

    if (invite) {
        ctx.body = { error: 'You have already invited this player.' };
        return;
    }

    invite = new Invite;
    invite.sender = ctx.session.userID;
    invite.invitee = Number(ctx.request.body["invitee"]);

    invite.save();
    ctx.body = { success: `You haved invited userID ${invite.invitee}!` };
});

teamsRouter.post("/accept-invite", async (ctx: ParameterizedContext<any>, next) => { 
    if (!ctx.isAuthenticated || !ctx.session.userID) {
        ctx.body = { error: "Your session has expired, please log in again." }; 
        return;
    }

    try {
        const invite = await Invite.findOne({
            where: {
                sender: ctx.request.body["invite"]["sender"],
                invitee: ctx.session.userID
            }
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
        })

        const team = new Team;
        team.team_name = "Team " + Math.floor(Math.random() * 9000 + 1000);
        team.player1 = players[0];
        team.player2 = players[1];
        
        team.save();

    } catch (err) {
        ctx.body = { "error": "Error while accepting invite: " + err };
        console.log(err);
    }
})

teamsRouter.get("/invites", async (ctx: ParameterizedContext<any>, next) => {

    if (!ctx.isAuthenticated || !ctx.session.userID) {
        ctx.body = { error: "Your session has expired, please log in again." }; 
        return;
    }

    const invites = await Invite.find({
        where: {
            invitee: ctx.session.userID
        }
    });

    ctx.body = invites;
});

export default teamsRouter;