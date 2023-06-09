import Router from "@koa/router";
import { ParameterizedContext } from "koa";
import { isHeadStaff, isLoggedInDiscord } from "../../../middleware";
import { Match } from "../../../Models/bracket";

const adminRouter = new Router();

adminRouter.use(isLoggedInDiscord);
adminRouter.use(isHeadStaff);

adminRouter.post("/user/refresh", async (ctx: ParameterizedContext<any>, next) => {
    // 1: Retrieve all users from postgres

    // 2: Fetch all users from osu api

    // 3: Update all users in postgres with new data
});

export default adminRouter;