var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var Mediator = require('./mediator');

var app = express();

const mediator = new Mediator();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


//Setup static delivery files
app.use(express.static(path.join(__dirname, '../frontend')));
app.use(express.static(path.join(__dirname, '../test')));

app.use('/messages', express.static(path.join(__dirname, '../messages')));
app.use('/graphic_framework', express.static(path.join(__dirname, '../node_modules/pixi.js/dist')));
app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules/bootstrap/dist')));
app.use('/jquery', express.static(path.join(__dirname, '../node_modules/jquery/dist')));
app.use('/protobuf', express.static(path.join(__dirname, '../node_modules/protobufjs/dist')));
app.use('/chai', express.static(path.join(__dirname, '../node_modules/chai')));
app.use('/mocha', express.static(path.join(__dirname, '../node_modules/mocha')));


//Setup Routes
// app.use('/api/v1/', require('./routes/index'));
// app.use('/api/v1/', require('./routes/games'));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.send({
  	message: err.message
  });
});

module.exports = app;
