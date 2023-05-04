import { config } from "node-config-ts";
import { DataSourceOptions } from "typeorm";
import { resolve } from "path";

// Entities
import { User } from "../Models/user"

export default {
    type: "mongodb",
    host: config.database.host,
    port: config.database.port,
    database: config.database.database,
    timezone: "Z",
    synchronize: false,
    logging: ["error"],
    maxQueryExecutionTime: 50,
    entities: [
       // `${resolve(__dirname, "Models")}/**/*.ts`,
        //`${resolve(__dirname, "Models")}/**/*.js`,
        User
    ],
    cache: {
        duration: 60000,
    },
} as DataSourceOptions;