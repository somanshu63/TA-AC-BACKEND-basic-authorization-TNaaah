var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var MongoStore = require('connect-mongo');
var session = require('express-session');
var auth = require('./middleware/auth')

require('dotenv').config();

var indexRouter = require('./routes/index');
var commentsRouter = require('./routes/comments');
var articlesRouter = require('./routes/articles');
var usersRouter = require('./routes/users');

//connect database
mongoose.connect('mongodb://localhost/blog', 
  {useUnifiedTopology: true}, (err) => {
    console.log(err ? err : 'connected to database');
  });

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb://localhost/blog'})
}));

app.use(flash());

app.use(auth.userInfo);

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/comments', commentsRouter);
app.use('/articles', articlesRouter);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
