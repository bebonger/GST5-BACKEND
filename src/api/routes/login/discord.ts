import Router from "@koa/router";
import passport from "koa-passport";
import { discordGuild } from "../../../discord";
import { config } from "node-config-ts";
import { ParameterizedContext } from "koa";
import { OsuUser } from "../../../Models/user";

// If you are looking for discord passport info then go to Server > passportFunctions.ts

const discordRouter = new Router();

discordRouter.get("/", async (ctx: ParameterizedContext<any>, next) => {
    let redirectURL = process.env.NODE_ENV === "production" ? config.gst5.publicUrl : config.api.publicUrl;
    ctx.cookies.set("redirect", redirectURL, { overwrite: true });
    console.log(redirectURL);
    await next();
}, passport.authenticate("discord", { scope: ["identify", "guilds.join"] }));

discordRouter.get("/callback", async (ctx: ParameterizedContext, next) => {
    return await passport.authenticate("discord", { scope: ["identify", "guilds.join"], failureRedirect: "/" }, async (err, user, info) => {
        if (user) {
            if (ctx.session) {
                console.log("test2");
                                
                var osuUser = await OsuUser.findOne({ where: { userID: ctx.session.userID }});
                if (osuUser.discord) {
                    osuUser.discord.remove();
                }
                osuUser.discord = user;
                await osuUser.save();
            } else
            {
                ctx.body = { error: "There is no osu! account linked to this discord account! Please register via osu! first." };
                return;
            }

            try {

                // Add user to server if they aren't there yet
                const guild = await discordGuild();
                try {
                    const discordUser = await guild.members.fetch(osuUser.discord.discordID);
                    await Promise.all([
                        discordUser.setNickname(osuUser.username),
                        discordUser.roles.add(config.discord.roles.verified),
                    ]);
                } catch (e) {
                    await guild.members.add(osuUser.discord.discordID, {
                        accessToken: info.token,
                        nick: osuUser.username,
                        roles: [config.discord.roles.verified],
                    });
                }
            } catch (err) {
                console.log("An error occurred in adding a user to the server / changing their nickname: " + err);
            }

            const redirect = ctx.cookies.get("redirect");
            ctx.cookies.set("redirect", "");
            ctx.redirect(redirect ?? "back");
        } else {
            const redirect = ctx.cookies.get("redirect");
            ctx.cookies.set("redirect", "");
            ctx.redirect(redirect ?? "back");
            return;
        }
    })(ctx, next);
});

export default discordRouter;