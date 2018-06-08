var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var User = require('../models/User');

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

/**
 * Sign in using Username and Password.
 */
passport.use(new LocalStrategy({ usernameField: 'username' }, function(username, password, done) {
  User.findOne({ username: username }, function(err, user) {
    if (err) { return done(err); }
    if (!user) {
      return done(null, false, { msg: `Username ${username} not found.` });
    }
    if (user.password !== password) {
      return done(null, false, { msg: 'Invalid username or password.' });
    }
    return done(null, user);
  });
}));

/**
 * Sign in with Google.
 */
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_ID,
  clientSecret: process.env.GOOGLE_SECRET,
  callbackURL: '/auth/google/callback',
  passReqToCallback: true
}, function(req, accessToken, refreshToken, profile, done) {
  User.findOne({ google: profile.id }, function(err, existingUser) {
    if (err) { return done(err); }
    if (existingUser) {
      return done(null, existingUser);
    }
    User.findOne({ username: profile.emails[0].value }, function(err, existingEmailUser) {
      if (err) { return done(err); }
      if (!existingEmailUser) {
        var user = new User();
        user.username = profile.emails[0].value;
        user.google = profile.id;
        user.save(function(err) {
          done(err, user);
        });
      }
    });
  });
}));

/**
 * Login Required middleware.
 */
exports.isAuthenticated = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/login');
};

exports.isAdministrator = function(req, res, next) {
  if (req.isAuthenticated() && req.user && req.user.username === 'Atanas') {
    return next();
  }
  req.flash('errors', { msg: 'You must login as administrator.' });
  res.redirect('/login');
};
