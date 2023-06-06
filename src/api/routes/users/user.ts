import Router from "@koa/router";
import { OsuUser } from "../../../Models/user";
import { isLoggedIn } from "../../../middleware";
import { appDataSource } from "../../../index";
import { ILike, Like, Raw } from "typeorm";
import { ParameterizedContext } from "koa";
import { userInfo } from "os";

const userRouter = new Router();

userRouter.get("/me", isLoggedIn, async (ctx: ParameterizedContext<any>, next) => {

    // query for user
    const user = await OsuUser.findOne({ 
        where: { userID: ctx.session.userID },  
        relations: ['discord']
    });

    if (!user) {
        ctx.logout();
        return;
    };

    console.log(user);
    ctx.body = await user.getInfo();
});

// route to retrieve users that are authenticated with the GST5 website
userRouter.get("/search", async (ctx: ParameterizedContext<any>, next) => {

    if (!ctx.request.query["playerSearchQuery"]) {
        ctx.body = [];
        return;
    }

    const users = await OsuUser.find({
        where: [
          { userID: Number.isNaN(Number(ctx.request.query["playerSearchQuery"])) ? -1 : Number(ctx.request.query["playerSearchQuery"]) },
          { username: ILike(`%${ctx.request.query["playerSearchQuery"]}%`) },
        ],
        relations: ['discord']
    });

    const promises = users.map(async user => {
        return user.getInfo();
    });
    
    const userInfoArray = await Promise.all(promises);
    ctx.body = userInfoArray;
});

userRouter.get("/search-exact", async (ctx: ParameterizedContext<any>, next) => {

    if (!ctx.request.query["playerSearchQuery"]) {
        ctx.body = [];
        return;
    }

    const searchQuery = ctx.request.query["playerSearchQuery"].toString().toLowerCase();

    const user = await OsuUser.findOne({
        where: [
          { userID: Number.isNaN(Number(ctx.request.query["playerSearchQuery"])) ? -1 : Number(ctx.request.query["playerSearchQuery"]) },
          { username: Raw(alias => `${alias} ILIKE '%${searchQuery}%'`) },
        ],
        relations: ['discord']
    });
    
    if (!user) {
        ctx.body = { 'error': "no user found" };
        return;
    }
    
    const info = await user.getInfo();

    console.log(info);
    ctx.body = [info];
});

userRouter.get("/all", async (ctx: ParameterizedContext<any>, next) => {

    const users = await OsuUser.find();

    const promises = users.map(async user => {
        return user.getInfo();
    });

    const userInfoArray = await Promise.all(promises);
    ctx.body = userInfoArray;
});


export default userRouter;