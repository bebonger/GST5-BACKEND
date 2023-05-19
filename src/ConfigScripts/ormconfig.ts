import { config } from "node-config-ts";
import { DataSourceOptions } from "typeorm";
import { resolve } from "path";

// Entities
import { OsuUser, DiscordUser } from "../Models/user"
import { Invite, Team } from './../Models/team';
import { Notification } from "../Models/notification";
import { Match, Schedule, Group } from "../Models/bracket";

export default {
    type: "postgres",
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    username: config.database.username,
    password: config.database.password,
    timezone: "Z",
    synchronize: true,
    logging: ["error"],
    maxQueryExecutionTime: 50,
    entities: [
       // `${resolve(__dirname, "Models")}/**/*.ts`,
        //`${resolve(__dirname, "Models")}/**/*.js`,
        OsuUser, DiscordUser,
        Invite, Team,
        Notification,
        Match, Schedule, Group
    ],
    cache: {
        duration: 60000,
    },
} as DataSourceOptions;