'use strict';

/**
 * Module dependencies.
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const exphbs = require('express-handlebars');
const errorHandler = require('errorhandler');

/**
 * Controllers (route handlers).
 */
const homeController = require('./controllers/home');

/**
 * Create Express server.
 */
const app = express();

/**
 * Config.
 */
// Load conf from config.js
app.set('settings', require('./config'));
//Export the conf
app.locals.settings = app.get('settings');

/**
 * Express configuration.
 */
// Handlebars config for templates
app.engine('.hbs', exphbs({ layoutsDir: "views", defaultLayout: 'index', extname: '.hbs' }));
// View settings
app.set('views', path.join(process.cwd(), '', 'views'));
app.set('view engine', '.hbs');

//Node_modules packages
app.use('/node_modules', express.static(path.join(process.cwd() + '/node_modules')));

//For the verbs HTTP get params
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

/**
 * Primary app routes.
 */
app.get('/favlangjs',function(req, res){
							homeController.main(req, res);
						  });

/**
 * Error Handler.
 */
app.use(errorHandler());

// Start Express Server.
app.listen(app.get('settings').port, function() {
  console.log('Listening port: ' + app.get('settings').port)
});

/** Export instance to be used in other files */
module.exports = app;