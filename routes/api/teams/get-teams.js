const express = require('express');
const router = express.Router();
const mongoose = require("mongoose");

router.get('/', async (req, res) => {
    let testTeams = {
        player1: "Demonical",
        player2: "_gt"
    }

    res.json(testTeams);
});

module.exports = router;