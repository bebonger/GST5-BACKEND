var environment = process.env.NODE_ENV

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session")
const cookieParser = require("cookie-parser");
const passport = require("passport");

// dotenv
require("dotenv").config();

const app = express();

// Use our middlewares
app.use(cors({origin: true, credentials: true}));
app.use(morgan("common"));
app.use(express.json());
app.use(cookieParser());
app.use(session(
    {
      secret: process.env.CLIENT_SECRET, // don't use this secret in prod :)
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: 'auto',
        httpOnly: false,
        maxAge: 3600000
      }
    })
  );
app.use(passport.initialize());
app.use(passport.session());

// models & routes
require('./config/passport');
app.use(require('./routes'));

// Provide a default port 
const port = process.env.SERVER_PORT || 3000;

// Listen to server  
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});