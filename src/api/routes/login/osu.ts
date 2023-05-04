import Router from "@koa/router";
import passport from "koa-passport";
import Axios from "axios";
import { redirectToMainDomain } from "./middleware";
import { config } from "node-config-ts";
import { ParameterizedContext } from "koa";
import { User } from "../../../Models/user";

const osuRouter = new Router();

osuRouter.get("/", async (ctx: ParameterizedContext<any>, next) => {
    const baseURL = ctx.query.site ? (config[ctx.query.site] ? config[ctx.query.site].publicUrl : config.gst5.publicUrl) : "";
    const params = ctx.query.redirect ?? "";
    const redirectURL = baseURL + params ?? "back";

    ctx.cookies.set("redirect", redirectURL, { overwrite: true });
    await next();
}, passport.authenticate("oauth2", { scope: ["identify", "public", "friends.read"] }));

osuRouter.get("/callback", async (ctx: ParameterizedContext<any>, next) => {
    return await passport.authenticate("oauth2", { scope: ["identify", "public", "friends.read"], failureRedirect: "/" }, async (err, user) => {
        if (user) {
            await user.save();

            // Save state in session as cross domain api calls will reset ctx.state
            ctx.session.state = ctx.state;
            ctx.login(user);
            await next();
        } else {
            const redirect = ctx.cookies.get("redirect");
            ctx.cookies.set("redirect", "");
            ctx.redirect(redirect ?? "back");
            return;
        }
    })(ctx, next);
}, async (ctx, next) => {
    try {
        // api v2 data
        const res = await Axios.get("https://osu.ppy.sh/api/v2/me", {
            headers: {
                Authorization: `Bearer ${ctx.state.user.osu.accessToken}`,
            },
        });
        const data = res.data;
        
        const redirect = ctx.cookies.get("redirect");
        ctx.cookies.set("redirect", "");
        ctx.redirect(redirect ?? "back");
    } catch (e) {
        if (e) {
            ctx.status = 500;
            console.error(e);
            ctx.body = { error: e };
        } else {
            throw e;
        }
    }
});


export default osuRouter;