const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const userModel = require("../../models/user-model")

// user will only get to this route if their cookie has not expired
router.get('/', async (req, res) => {
    const User = userModel;
    const user = await User.findOne({'sessionID' : req.sessionID}, 'userData').exec();
    if (user) {
        console.log(user.userData);
        req.flash("test");
        res.json(user.userData);
    }

});

module.exports = router;