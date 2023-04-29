const express = require('express');
const router = express.Router();

router.use('/get-teams', require('./get-teams'));

module.exports = router;