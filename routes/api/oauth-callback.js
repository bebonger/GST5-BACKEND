const express = require("express");
const router = express.Router();
const axios = require("axios").default;
const qs = require("query-string");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const passport = require("passport");

// models
const userModel = require("../../models/user-model")

// env variables
const environment = process.env.NODE_ENV;
const url = `https://osu.ppy.sh/oauth/token`;
const meEndpoint = `https://osu.ppy.sh/api/v2/me/osu`;
const isDevelopment = environment == 'development';

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
    axios.post(url, qs.stringify({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: req.query.code,
        grant_type: "authorization_code",
        redirect_uri: process.env.REDIRECT_URI,
    }), config)
    .then((result) => {
        // save token to session
        req.session.token = result.data.access_token;
        getUser(result.data.access_token, req, res);
    })
    .catch((err) => {
        console.error(err);
    });
});

async function getUser(access_token, req, res) {
    // request user data through /me endpoint
    const result = await axios.get(meEndpoint, {            
        headers: {
            "Authorization": `Bearer ` + access_token,
            "Accept": "application/json",
            "Content-Type": "application/json",
        }
    })

    if (!result) {
        throw 'user not found or error or something';
    }

    // console.log(result);
    try {
        const user = userModel;
        data = {
            userID: result.data.id,
            sessionID: req.sessionID,
            userData: {
                avatar_url: result.data.avatar_url,
                country_code: result.data.country_code,
                default_group: result.data.default_group,
                id: result.data.id,
                is_active: result.data.is_active,
                is_bot: result.data.is_bot,
                is_deleted: result.data.is_deleted,
                username: result.data.username,
                is_restricted: result.data.is_restricted,
                global_rank: result.data.statistics.global_rank,
                country_rank: result.data.statistics.country_rank,
                badges: result.data.badges.length
            }
        }
    
        // console.log(user);
        
        // TODO: Check for existing doc in Mongo, update if exists, insert if doesnt

        // add user to table of authenticated users
        var query = { userID: user.userID };
        var options = { upsert: true, new: true, setDefaultsOnInsert: true};

        // const userObj = await user.findOneAndUpdate(query, { $set: { userData: data.userData, sessionID: data.sessionID, userID: data.userID  } }, options);
        const doc = await user.findOne({ userID: data.userID });
        if (doc) {
            doc.userData = data.userData;
            doc.sessionID = data.sessionID;
            doc.save();
            console.log(doc);
        } else {
            doc = new user({
                data                
            })
            console.log(await doc.save()); 
        }

        req.flash("test");
        res.redirect(isDevelopment ? process.env.FRONTEND_DEVELOPMENT_URI : process.env.FRONTEND_PRODUCTION_URI);
        
    } 
    catch (err) {
        console.log(err);
    }  
}

module.exports = router;