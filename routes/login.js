var fs = require("fs");
var path = require("path");
var express = require("express");
var router = express.Router();
var util = require("../util");

// POST /
router.post("/login", (req, res) => {
  let user = req.body.user;
  let token = util.login(user);

  if (token) {
    req.session.token = token;
    req.session.user = user;
    if (util.userDocuments(user).length === 0) {
      // When the user doesn't have any PDF we upload a sample document.
      uploadSamplePDF(user, "./assets/example.pdf")
        .then(() => {
          res.redirect("/");
        })
        .catch(err => {
          console.log("An error occurred while uploading the sample PDF: " + err.statusCode || err);
          res.redirect("/");
        });
    } else {
      res.redirect("/");
    }
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

function uploadSamplePDF(user, filename) {
  var file = fs.readFileSync(filename);
  return util.upload(
    {
      buffer: file,
      originalname: path.basename(filename)
    },
    user
  );
}

module.exports = router;
