const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const session = require("express-session")

// dotenv
require("dotenv").config();

const app = express();

// Use our middlewares
app.use(cors({origin: true, credentials: true}));
app.use(morgan("common"));
app.use(express.json());
app.use(session(
  {
    secret: process.env.CLIENT_SECRET, // don't use this secret in prod :)
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: 'auto',
      httpOnly: true,
      maxAge: 3600000
    }
  })
);

// routes
app.use('/api/login', require('./routes/login'))
app.use('/api/oauth-callback', require('./routes/oauth-callback'))

// Provide a default port 
const port = process.env.SERVER_PORT || 3000;

// Listen to server  
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});