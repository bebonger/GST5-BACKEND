import { User } from 'discord.js';
import { OsuUser, DiscordUser } from './Models/user';
import { config } from "node-config-ts";
import { getMember } from "./discord";
import { ParameterizedContext, Next } from "koa";
import { Notification } from './Models/notification';

interface discordRoleInfo {
    section: string;
    role: string;
}

// General middlewares
async function isLoggedIn (ctx: ParameterizedContext, next: Next): Promise<void> {

    if (!ctx.isAuthenticated || !ctx.session.userID) {
        ctx.body = { error: "User is not logged in via osu!" };
        return;
    }

    await next();
}

async function isLoggedInDiscord (ctx: ParameterizedContext, next: Next): Promise<void> {
    
    let discordUser = null;
    if (ctx.session.userID) {
        discordUser = await OsuUser.findOne({ where: {
            userID: ctx.session.userID
        }})
        discordUser = discordUser.discord;
    }

    if (!discordUser) {
        ctx.body = { error: "User is not logged in via discord!" };
        return; 
    }

    await next();
}

async function IsEligibleToPlay (ctx: ParameterizedContext, next: Next): Promise<void> {
    
    if (ctx.session.userID) {
        const osuUser = await OsuUser.findOne({ where: {
            userID: ctx.session.userID
        }})

        if (osuUser.country_code !== 'SG' || osuUser.is_restricted) {
            ctx.body = { error: "User is not eligible to participate" }; 
            return;
        }

        await next();
    } else {
        ctx.body = { error: "You are not logged in!" };
    }

    return;
}

async function CreateNotification (ctx: ParameterizedContext, next: Next): Promise<void> {

    if (!ctx.state.notification || !ctx.state.osuUser) {
        console.log("Error while trying to create notification: ctx state was not passed to this middleware."); 
        return;
    }

    const notification = new Notification;
    notification.user = ctx.state.osuUser;
    notification.type = ctx.state.notification.type;
    notification.data = ctx.state.notification.data;
    notification.isRead = false;

    console.log(notification);

    notification.save();
}

export { isLoggedIn, isLoggedInDiscord, IsEligibleToPlay, CreateNotification };