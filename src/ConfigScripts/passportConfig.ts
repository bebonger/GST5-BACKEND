import passport from "koa-passport";
import { config } from "node-config-ts";
import { Strategy as DiscordStrategy } from "passport-discord";
import OAuth2Strategy from "passport-oauth2";
import { OsuUser, DiscordUser } from "../Models/user";
import Axios from "axios";
import { discordClient } from "../discord";
import { FindOneOptions, FindOptionsWhere } from 'typeorm';

export function setupPassport () {
    // Setup passport
    passport.serializeUser((user: OsuUser, done: CallableFunction) => {
        if (user && user.userID > 0) {
            done(null, user.userID);
        } else {
            console.error('Something happened while serializing the user', user);
            done('An error has occured! Please refresh the page and try again.');
        }
    });

    passport.deserializeUser(async (id: number, done: CallableFunction) => {
        if (!id) return done(null, null);

        try {
            const user = await OsuUser.findOne({
                where: { userID: Number(id) },
            });
            if (user)
                done(null, user);
            else
                done(null, null);
        } catch(err) {
            console.log("Error while deserializing user", err);
            done(err, null);
        }        
    });

    passport.use(new DiscordStrategy({
        clientID: config.discord.clientId,
        clientSecret: config.discord.clientSecret,
        callbackURL: `${config[process.env.NODE_ENV === "production" ? "gst5" : "api"].publicUrl}/api/login/discord/callback`,
    }, discordPassport));

    passport.use(new OAuth2Strategy({
        authorizationURL: "https://osu.ppy.sh/oauth/authorize",
        tokenURL: "https://osu.ppy.sh/oauth/token",
        clientID: config.osu.v2.clientId,
        clientSecret: config.osu.v2.clientSecret,
        callbackURL: `${config[process.env.NODE_ENV === "production" ? "gst5" : "api"].publicUrl}/api/login/osu/callback`,
    }, osuPassport));
}

// If you are looking for osu and discord auth login endpoints info then go to Server > api > routes > login

export async function discordPassport (accessToken: string, refreshToken: string, profile: DiscordStrategy.Profile, done: OAuth2Strategy.VerifyCallback): Promise<void> {
    try {
        let userDiscord = await DiscordUser.findOne({ where: {
            discordID: profile.id
        }});

        if (!userDiscord) {
            userDiscord = new DiscordUser;
            userDiscord.discordID = profile.id;
        }

        userDiscord.username = profile.username;
        userDiscord.avatar = "https://cdn.discordapp.com/avatars/" + profile.id + "/" + profile.avatar + ".png",
        userDiscord.last_verified = new Date;

        await DiscordUser.upsert(userDiscord, { conflictPaths: ['discordID'] });

        done(null, userDiscord, {token: accessToken});
    } catch(error: any) {
        console.log("Error while authenticating user via Discord", error);
        done(error, undefined);
    }
}

export async function osuPassport (accessToken: string, refreshToken: string, profile: any, done: OAuth2Strategy.VerifyCallback): Promise<void> {
    try {
        const res = await Axios.get("https://osu.ppy.sh/api/v2/me/osu", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const userProfile = res.data;
        let user = await OsuUser.findOne({ where: {
            userID: userProfile.id
        }});

        if (!user) {
            user = new OsuUser;
        }

        user.userID = userProfile.id;
        user.username = userProfile.username;
        user.avatar = userProfile.avatar_url;
        user.global_rank = userProfile.statistics.global_rank,
        user.country_rank = userProfile.statistics.country_rank,
        user.performance_points = userProfile.statistics.pp;
        user.badges = userProfile.badges.length;
        user.is_restricted = userProfile.is_restricted;
        user.country_code = userProfile.country_code;
        user.last_verified = new Date;
        user.accessToken = accessToken;

        await OsuUser.upsert(user, { conflictPaths: ['userID'] });
        
        done(null, user);
    } catch (error: any) {
        console.log("Error while authenticating user via osu!", error);
        done(error, undefined);
    }
}