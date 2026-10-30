var express = require("express");
var router = express.Router();

router.use((req, res, next) => {
  let { user } = req.session;

  if (user || req.path === "/login") {
    req.user = user;
    next();
  } else {
    res.redirect("/login");
  }
});

module.exports = router;
