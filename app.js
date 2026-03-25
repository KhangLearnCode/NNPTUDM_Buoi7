var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
let mongoose = require('mongoose')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Normalize multiple slashes (e.g. /api/v1//auth) to improve routing robustness.
app.use((req, res, next) => {
  if (req.url.includes('//')) {
    req.url = req.url.replace(/\/+/g, '/');
  }
  next();
});

app.use('/', indexRouter);
//localhost:3000/users
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/roles', require('./routes/roles'));
app.use('/api/v1/products', require('./routes/products'));
app.use('/api/v1/categories', require('./routes/categories'));
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/inventories', require('./routes/inventories'));


mongoose.connect('mongodb://localhost:27017/NNPTUD-C4');
mongoose.connection.on('connected', function () {
  console.log("connected");
})
mongoose.connection.on('disconnected', function () {
  console.log("disconnected");
})
mongoose.connection.on('disconnecting', function () {
  console.log("disconnecting");
})
// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler (API-friendly JSON response)
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  const isDev = req.app.get('env') === 'development';

  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(isDev ? { stack: err.stack } : {})
  });
});

module.exports = app;
