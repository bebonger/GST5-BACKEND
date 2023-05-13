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

    if (!ctx.request.body["invitee"] || ctx.request.body["invitee"] === "" || ctx.request.body["invitee"] == ctx.session.userID) {
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

    const [sender, invitee] = await Promise.all([
        OsuUser.findOne({where: { userID: ctx.session.userID }}),
        OsuUser.findOne({where: { userID: ctx.request.body["invitee"] }})
    ]);

    console.log(sender);

    if (!sender || !invitee) {
        ctx.body = { error: "Invalid sender or invitee." };
        return;
    }

    invite = new Invite;
    invite.sender = sender;
    invite.invitee = invitee;

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
            invitee: { 
                userID: ctx.session.userID
            }
        },
        relations: [ "sender", "invitee" ]
    });



    ctx.body = invites;
});

export default teamsRouter;