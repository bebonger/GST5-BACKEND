const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/logout', require('./logout'))
router.use('/oauth-callback', require('./oauth-callback'));
router.use('/get-user', require('./get-user'))

module.exports = router;