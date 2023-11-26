const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');

const presentationsRouter = require('./routes/presentations');
const hostRouter = require('./routes/host');
const authentication = require('./common/security/authentication');
const bodyParser = require('body-parser');

const app = express();

app.use(cors())
app.use(bodyParser.json({limit: '20mb'}))

if(process.env.environment === 'develpment'){
  app.use(logger('dev'));
}
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

//app.use(authentication);
app.use('/api/presentation/', presentationsRouter);
app.use('/api/host/', [authentication], hostRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.send('OK');
});

if (process.env.environment === 'develpment') {
  // error handler
  app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
  });
}

module.exports = app;
