import Router from "@koa/router";
import { User } from "../../Models/user";
import { isLoggedIn } from "../../middleware";

const userRouter = new Router();

userRouter.get("/", isLoggedIn, async (ctx) => {
    ctx.body = await ctx.state.user.getInfo();
});

export default userRouter;