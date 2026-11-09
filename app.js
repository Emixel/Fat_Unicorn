require('dotenv').config({ quiet: true });

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var discordRouter = require('./routes/discord');
var communityRouter = require('./routes/community.js');
var shopRouter = require('./routes/shop.js');
var gamesRouter = require('./routes/games.js');
var aboutRouter = require('./routes/about.js');

var app = express();
app.disable('x-powered-by');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api/discord', discordRouter);
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/community', communityRouter);
app.use('/shop', shopRouter);
app.use('/games', gamesRouter);
app.use('/about', aboutRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  var status = err.status || 500;
  res.locals.message = status === 404 ? 'Not Found' : 'Something went wrong';
  res.locals.status = status;
  res.status(status);
  res.render('error');
});

module.exports = app;
