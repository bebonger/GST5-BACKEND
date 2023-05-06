import Router from "@koa/router";
import { isLoggedIn } from "../../../middleware";
import { OsuUser, DiscordUser } from "../../../Models/user";

const logoutRouter = new Router();

logoutRouter.get("/", async (ctx) => {
    if (ctx.isAuthenticated()) {
        const user = await OsuUser.findOne({ 
            where: { userID: ctx.session.userID },
            relations: ['discord']
        });
        await user.remove();
        await ctx.logout();
        ctx.session = null;
        ctx.redirect("back");
    } else {
        ctx.body = { error: "Unable to logout!" };
        ctx.throw(401);
    }
});

export default logoutRouter;