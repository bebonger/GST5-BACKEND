import { config } from 'node-config-ts';
import { DataSource } from "typeorm";
import crypto from "crypto";
import mongoose from "mongoose";

// Koa
import Koa from "koa";
import Router from "@koa/router";
import logger from "koa-logger";
import json from "koa-json";
import bodyParser from "koa-bodyparser";
import Session from "koa-session";
import MongooseStore from "koa-session-mongoose";
import passport, { session } from "koa-passport";
import Mount from "koa-mount";
import cors from "@koa/cors";

// middleware
import { setupPassport } from "./ConfigScripts/passportConfig";
import osuRouter from "./api/routes/login/osu";
import discordRouter from "./api/routes/login/discord";
import userRouter from "./api/routes/user";

import ormConnectionOptions from "./ConfigScripts/ormconfig";

const app = new Koa();
const router = new Router();

router.post("/", async (ctx, next) => {
    const data = ctx.request.body;
    ctx.body = data;

    await next();
});

// Middlewares
app.use(cors({credentials:true}));

// Connect to MongoDB
mongoose.connect(config.database.url);

app.keys = [ config["secretKey"] ];
app.use(Session({
    domain: config.cookiesDomain,
    secure: process.env.NODE_ENV !== "development",
    overwrite: true,
    httpOnly: true,
    renew: true,
    maxAge: 60 * 24 * 60 * 60 * 1000, // 2 months
    signed: true,
    store: new MongooseStore()
}, app));

app.use(json());
app.use(logger());
app.use(bodyParser());
app.use(passport.initialize());
app.use(passport.session());

// Error handler
app.use(async (ctx, next) => {
    try {
        if (ctx.originalUrl !== "/favicon.ico" && process.env.NODE_ENV === "development") {
            console.log("\x1b[33m%s\x1b[0m", ctx.originalUrl);
        }

        await next();
    } catch (err: any) {
        console.log(err);
        
        ctx.status = err.status || 500;
        ctx.body = { error: "Something went wrong!" };
    }
});

// Routes
app.use(router.routes()).use(router.allowedMethods());

// Login
app.use(Mount("/api/login/osu", osuRouter.routes()));
app.use(Mount("/api/login/discord", discordRouter.routes()));
app.use(Mount("/api/user", userRouter.routes()));

// Database
export const appDataSource = new DataSource(ormConnectionOptions);

console.log("Starting server");

appDataSource.initialize().then((connection: DataSource) => {
    console.log(`Connected to the ${connection.options.database} (${connection.options.entities}) database!`);
        
    setupPassport();
    // app.listen(config.api.port);
    app.listen(3000);
});