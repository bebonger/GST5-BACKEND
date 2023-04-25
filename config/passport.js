// OAuth2.0 Passport
var passport = require('passport')
var OsuStrategy = require('passport-oauth2');

passport.use('osu', new OsuStrategy({
    authorizationURL: 'https://osu.ppy.sh/oauth/authorize',
    tokenURL: 'https://osu.ppy.sh/oauth/token',
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI
    },
    (accessToken, refreshToken, profile, done) => {
        console.log(accessToken)
        done(null, profile); // passes the profile data to serializeUser
    }
));

passport.serializeUser(function(user, cb) {
    process.nextTick(function() {
        console.log("authenticated user: " + user + "\n")
    });
});

passport.deserializeUser(function(user, cb) {
    process.nextTick(function() {
        return cb(null, user);
    });
});