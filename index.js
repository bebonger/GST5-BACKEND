var environment = process.env.NODE_ENV

const express = require("express");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const proxy = require('express-http-proxy');
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const passport = require("passport");

// dotenv
require("dotenv").config();

main().catch(err => console.log(err));

async function main() {
    const app = express();

    // Use our middlewares
    app.use(cors({origin: true, credentials: true}));
    app.use(morgan("common"));
    app.use(express.json());
    app.use(cookieParser());
    app.use(session({
        secret: process.env.CLIENT_SECRET, // don't use this secret in prod :)
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/gst5' }),
        cookie: {
            secure: false,
            httpOnly: true,
            maxAge: 3600000
        }})
    );

    app.use(passport.initialize());
    app.use(passport.session({ secret: process.env.CLIENT_SECRET }));

    // models & routes
    require('./config/passport');
    require('./config/database');
    app.use(require('./routes'));


    // Provide a default port 
    const port = process.env.SERVER_PORT || 3000;

    // Listen to server  
    app.listen(port, () => {
    console.log(`Listening on port ${port}`);
    });

}
