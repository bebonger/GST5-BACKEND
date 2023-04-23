const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/oauth-callback', require('./oauth-callback'));

module.exports = router;