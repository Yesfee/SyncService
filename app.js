var createError = require('http-errors');
var express = require('express');
var path = require('path');
var SysConfig = require('./config/SysConfig');
global.appRoot = path.resolve(__dirname);
process.env.NODE_ENV = SysConfig.nod_env;
const i18n = require('i18n');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var sync = require('./routes/sync');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

i18n.configure({
  locals: ['en'],
  directory: __dirname + '/class/language',
  defaultLocale: 'en',
  cookie: 'lang',
  updateFiles: false,
  register: global,
});

app.use(i18n.init);

app.use('/', indexRouter);
app.use('/async', sync);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
