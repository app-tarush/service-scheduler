var express = require("express");
var path = require("path");
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var logger = require("morgan");
require("dotenv").load();

// routes specific modules
var job = require("./routes/job");

// creating app object!
var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/job', job);

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
    res.render('error');
});

/**** this app will listen to port 3001 ****/
app.listen(3001, () => console.log('Hawk app listening on port 3001!'));

module.exports = app;