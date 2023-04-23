const express = require('express');
const router = express.Router();
const jwt = require("jsonwebtoken");

// user will only get to this route if their cookie has not expired
router.post('/', (req, res) => {
    console.log(req.body);
    console.log("incoming token: " + req.body.token + "\n")
    const decodedToken = jwt.verify(req.body.token, process.env.CLIENT_SECRET);
    console.log(decodedToken);
    res.json(decodedToken);
});

module.exports = router;