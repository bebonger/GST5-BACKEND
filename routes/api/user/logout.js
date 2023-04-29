const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    req.logout();
    req.session = null;
    res.redirect('/');
});

module.exports = router;