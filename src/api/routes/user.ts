import Router from "@koa/router";
import { OsuUser } from "../../Models/user";
import { isLoggedIn } from "../../middleware";
import { User } from "discord.js";

const userRouter = new Router();

userRouter.get("/", isLoggedIn, async (ctx) => {

    // query for user

    const user = await OsuUser.findOne({ 
        where: { userID: ctx.session.userID },  
        relations: ['discord']
    });

    console.log(user);
    ctx.body = await user.getInfo();
});

export default userRouter;