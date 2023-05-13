import Router from "@koa/router";
import { isLoggedIn } from "../../../middleware";
import { ParameterizedContext } from "koa";
import { Notification } from "../../../Models/notification";

const notificationsRouter = new Router();

notificationsRouter.get("/", isLoggedIn, async (ctx: ParameterizedContext<any>, next) => {
    const notifications = await Notification.find({
        where: {
            user: {
                userID: ctx.session.userID
            }
        }
    });

    if (!notifications) {
        ctx.body = { "error": "Something went wrong! Please refresh and try again." };
        return;
    }

    ctx.body = notifications;
});

notificationsRouter.post("/read", isLoggedIn, async (ctx: ParameterizedContext<any>, next) => {
    
    if (!ctx.request.body["notificationId"] || Number.isNaN(ctx.request.body["notificationId"])) {
        ctx.body = { error: "Invalid Notification" };
        return;
    }
    
    const notification = await Notification.findOne({
        where: {
            id: Number(ctx.request.body["notificationId"]),
            user: {
                userID: ctx.session.userID
            },
        }
    });

    if (!notification) return; // dont really care if the notification doesnt exist
    
    notification.isRead = true;
    await notification.save();
});

notificationsRouter.post("/remove", isLoggedIn, async (ctx: ParameterizedContext<any>, next) => {
    
    if (!ctx.request.body["notificationId"] || Number.isNaN(ctx.request.body["notificationId"])) {
        ctx.body = { error: "Invalid Notification" };
        return;
    }
    
    const notification = await Notification.findOne({
        where: {
            id: Number(ctx.request.body["notificationId"]),
            user: {
                userID: ctx.session.userID
            },
        }
    });

    if (!notification) return; // dont really care if the notification doesnt exist

    await notification.remove();
});

notificationsRouter.post("/clear", isLoggedIn, async (ctx: ParameterizedContext<any>, next) => {
    
    const notifications = await Notification.find({
        where: {
            user: {
                userID: ctx.session.userID
            }
        }
    });

    if (!notifications) return; // dont really care if the notification doesnt exist
    
    const promises = notifications.map(async notif => {
        return notif.remove();
    });

    await Promise.all(promises);
});

export default notificationsRouter;  