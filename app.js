const createError = require('http-errors');
const express = require('express');
require('dotenv').config();
const mongoose = require("mongoose");

mongoose.set("strictQuery", false);

// Get the MongoDB URI from .env
const mongoDB = process.env.MONGO_URI;

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect(mongoDB);
  console.log("Connected to MongoDB");
}

const path = require('path');

const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index.js');
const adminRouter = require('./routes/admin.js');
const loginRouter = require('./routes/login.js');
const registerRouter = require('./routes/register.js');
const bookRouter = require('./routes/book.js');
const confirmationRouter = require('./routes/confirmation.js');
const userPurchasesRouter = require('./routes/userPurchases.js');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/admin', adminRouter);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/book', bookRouter);
app.use('/confirmation', confirmationRouter);
app.use('/userPurchases', userPurchasesRouter);


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
/*router.use('/public/images', express.static('/public/images'));*/
module.exports = app;
