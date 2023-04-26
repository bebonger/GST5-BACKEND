const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/', (req, res) => {
    console.log("test");
});
module.exports = router;