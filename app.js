var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var search = require('./routes/search');
var tt = require('./routes/tt');
var ftc = require('./routes/ftc');
var KYEC_stat = require('./routes/KYEC_stat');
var volPerDevice = require('./routes/topVolPerDevice');

/* AJAX server side code */
var search_AJAX = require('./routes/search_AJAX');
var tt_AJAX = require('./routes/tt_AJAX');
var ftc_AJAX = require('./routes/ftc_AJAX');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);

app.use('/', search);
app.use('/', search_AJAX);

app.use('/', tt);
app.use('/', tt_AJAX);

app.use('/', ftc);
app.use('/', ftc_AJAX);

app.use('/', volPerDevice);
app.use('/', KYEC_stat);


/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
