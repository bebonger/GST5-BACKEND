import Router from "@koa/router";
import { IsEligibleToPlay } from "../../../middleware"
import { ParameterizedContext } from "koa";
import { Invite, Team } from "../../../Models/team";

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