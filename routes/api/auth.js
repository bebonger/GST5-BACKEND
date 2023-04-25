const express = require('express');
const router = express.Router();
const passport = require('passport');

router.get('/',

  // const stateValue = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  // req.session.stateValue = stateValue
  // res.redirect(`https://osu.ppy.sh/oauth/authorize?client_id=${process.env.CLIENT_ID}&redirect_uri=${process.env.REDIRECT_URI}&response_type=code&state=${stateValue}&scope=public+identify`);

    passport.authenticate('osu', { 
      session: true,
      scope: ['public', 'identify'],  
  }),
);
module.exports = router;