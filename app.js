const express = require("express");
const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Set up handlebars
const exphbs = require("express-handlebars");
app.engine("hbs", exphbs({ defaultLayout: "main", extname: '.hbs' }));
app.set("view engine", "hbs");

// Set up body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

// Set up cookie-parser
const cookieParser = require("cookie-parser");
app.use(cookieParser());

// Set up serving static middleware
app.use(express.static(__dirname + "/public"));


const index = require('./routes/index');
const chatroom = require('./routes/chatroom');

app.use('/', index);
app.use('/chatroom', chatroom);

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



io.on("connection", client => {
	console.log("websockets connection open");
});


server.listen(3000);