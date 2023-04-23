const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/',
    passport.authenticate('osu', { 
      session: true,
      scope: ['public', 'identify'],  
  })
);
module.exports = router;