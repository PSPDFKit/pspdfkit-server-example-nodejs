var express = require("express");
var router = express.Router();
var db = require("../db");
var util = require("../util");

// POST /
router.post("/login", (req, res) => {
  let user = req.body.user;
  let token = util.login(user);

  if (token) {
    req.session.token = token;
    req.session.user = user;
    res.redirect("/");
  } else {
    req.session.token = null;
    req.session.user = null;
    res.redirect("/login");
  }
});

// GET /
router.get("/login", (req, res) => {
  req.session.user = null;
  req.session.token = null;
  res.render("login");
});

module.exports = router;
