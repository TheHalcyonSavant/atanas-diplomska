/**
 * Module dependencies.
 */
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var dotenv = require('dotenv').config();  // Load environment variables from .env file, where API keys and passwords are configured.
var flash = require('express-flash');
var path = require('path');
var mongoose = require('mongoose');
var passport = require('passport');
var sass = require('node-sass-middleware');

/**
 * Controllers (route handlers).
 */
var userController = require('./controllers/user');
var mapController = require('./controllers/map');

/**
 * Keys and Passport configuration.
 */
var passportConfig = require('./config/passport');

/**
 * Create Express server.
 */
var app = express();

/**
 * Connect to MongoDB.
 */
mongoose.connect(process.env.MONGODB_URI);
mongoose.connection.on('error', function(err) {
  console.error(err);
  console.log('MongoDB connection error. Please make sure MongoDB is running.');
  process.exit();
});

/**
 * Express configuration.
 */
app.set('host', '0.0.0.0');
app.set('port', 8081);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(bodyParser.json()); // parse json from client and populate req.body
app.use(bodyParser.urlencoded({ extended: true })); // parse URL encoded data from client and populate req.body
app.use(session({  // needed for flash middleware
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: 1209600000 }, // two weeks in milliseconds
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));

/**
 * Primary app routes.
 */
app.get('/', passportConfig.isAuthenticated, mapController.index);
app.get('/map', passportConfig.isAuthenticated, mapController.getMarkers);
app.post('/map', passportConfig.isAuthenticated, mapController.saveMarker);
app.delete('/map', passportConfig.isAdministrator, mapController.deleteMarker);
app.get('/table', passportConfig.isAdministrator, mapController.getTable);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);

/**
 * OAuth authentication routes. (Sign in)
 */
app.get('/auth/google', passport.authenticate('google', { scope: 'profile email' }));
app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login' }), function(req, res) {
  res.redirect('/');
});

/**
 * Start Express server.
 */
app.listen(app.get('port'), function() {
  console.log('App is running at http://localhost:%d', app.get('port'));
  console.log('  Press CTRL-C to stop\n');
});

module.exports = app;
