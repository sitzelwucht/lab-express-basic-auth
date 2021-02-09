// ℹ️ Gets access to environment variables/settings
require('dotenv/config');

// ℹ️ Connects to the database
require('./db');

// Handles http requests (express is node js framework)
const express = require('express');
const mongoose = require('mongoose')

// Handles the handlebars
const hbs = require('hbs');

const app = express();

// ℹ️ This function is getting exported from the config folder. It runs most middlewares
require('./config')(app);

// default value for title local
const projectName = 'lab-express-basic-auth';
const capitalized = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();


const session = require('express-session');
const MongoStore = require('connect-mongo')(session);

app.use( session ({
 secret: 'pupper123',
  saveUninitialized: false,
  resave: false,
  cookie: {
    maxAge: 1000*60*60*24 // millisesconds, exp 1 day
  },
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 60*60*24, //in seconds, expires in 1 day
  })

}))
 
app.locals.title = `${capitalized(projectName)}- Generated with IronGenerator`;

// 👇 Start handling routes here
const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth.routes')
app.use('/', auth)

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require('./error-handling')(app);

module.exports = app;
