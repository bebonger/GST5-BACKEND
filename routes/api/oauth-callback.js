const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const qs = require("query-string");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const passport = require("passport");

const environment = process.env.NODE_ENV
const url = `https://osu.ppy.sh/oauth/token`;
const meEndpoint = `https://osu.ppy.sh/api/v2/me/osu`;

var isDevelopment = environment == 'development';

const config = {
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
  },
};

router.get("/", (req, res) => {
// State from Server
  const stateFromServer = req.query.state;
  if (stateFromServer !== req.session.stateValue) {
    console.log("State doesn't match. uh-oh.");
    console.log(`Saw: ${stateFromServer}, but expected: &{req.session.stateValue}`);
    res.redirect(302, '/');
    return;
  }

  

  //post request to /token endpoint
  axios
    .post(
        url,
        qs.stringify({
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET,
            code: req.query.code,
            grant_type: "authorization_code",
            redirect_uri: process.env.REDIRECT_URI,
        }),
        config
    )
    .then((result) => {

        // save token to session
        req.session.token = result.data.access_token;
        // console.log(result)

        getUser(result.data.access_token, res);
    })
    .catch((err) => {
        console.error(err);
    });
});

function getUser(access_token, res) {
    // request user data through /me endpoint
    axios.get(meEndpoint, {            
        headers: {
            "Authorization": `Bearer ` + access_token,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
    })
    .then((result) => {
        // console.log(result);

        try {
            const user = {
                avatar_url: result.data.avatar_url,
                country_code: result.data.country_code,
                id: result.data.id,
                username: result.data.username,
                is_restricted: result.data.is_restricted,
                global_rank: result.data.statistics.global_rank,
                country_rank: result.data.statistics.country_rank
            };

            // console.log(user);

            const token = jwt.sign(
                user, 
                process.env.CLIENT_SECRET,
                {
                    expiresIn: "24h"
                }
            );
            
            
            res.cookie("user_token", token, {
                httpOnly: false,
                secure: true,
                sameSite: "none",
                maxAge: 24 * 60 * 60 * 1000, // 24 hours
                // domain: isDevelopment ? process.env.FRONTEND_DEVELOPMENT_URI : process.env.FRONTEND_PRODUCTION_URI
            });
            
            res.redirect(isDevelopment ? process.env.FRONTEND_DEVELOPMENT_URI : process.env.FRONTEND_PRODUCTION_URI);

            console.log("token: " + token + "\n");
            console.log(isDevelopment);
            // console.log(environment);
            
            
        } 
        catch (err) {
            console.log(err);
        }  

    }).catch(err => {
        console.log(err);
    });
}

module.exports = router;