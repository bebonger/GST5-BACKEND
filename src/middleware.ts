import { User } from 'discord.js';
import { OsuUser, DiscordUser } from './Models/user';
import { config } from "node-config-ts";
import { getMember } from "./discord";
import { ParameterizedContext, Next } from "koa";

interface discordRoleInfo {
    section: string;
    role: string;
}

// General middlewares
async function isLoggedIn (ctx: ParameterizedContext, next: Next): Promise<void> {

    if (!ctx.session.userID) {
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

export { isLoggedIn, isLoggedInDiscord, IsEligibleToPlay };