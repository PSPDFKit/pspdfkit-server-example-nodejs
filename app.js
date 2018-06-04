var express = require("express");
var path = require("path");
var logger = require("morgan");
var config = require("./config");
var bodyParser = require("body-parser");
var cookieParser = require("cookie-parser");
var session = require("express-session");
var app = express();

// config
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  session({
    secret: config.secret,
    resave: false,
    saveUninitialized: true
  })
);
app.use(logger("dev"));

// routes
app.use(express.static(path.join(__dirname, "public")));
app.use(require("./routes/api"));
app.use(require("./routes/auth"));
app.use(require("./routes/login"));
app.use("/", require("./routes/documents"));
app.use("/upload", require("./routes/upload"));

module.exports = app;
