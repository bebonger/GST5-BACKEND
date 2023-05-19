import Router from "@koa/router";
import { ParameterizedContext } from "koa";
import { isHeadStaff } from "../../../middleware";
import { Match } from "../../../Models/bracket";

const scheduleRouter = new Router();

scheduleRouter.post("/create", isHeadStaff, async (ctx: ParameterizedContext<any>, next) => {
    
});

export default { scheduleRouter };