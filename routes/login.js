var fs = require("fs");
var path = require("path");
var router = require("express").Router();
var util = require("../util");

// POST /
router.post("/login", async (req, res) => {
  let user = req.body.user;
  let token = util.login(user);

  if (token) {
    req.session.token = token;
    req.session.user = user;

    if (util.userDocuments(user).length === 0) {
      // When the user doesn't have any PDF we upload a sample document.
      try {
        await uploadSamplePDF(user, "./assets/example.pdf");
      } catch (err) {
        console.log("An error occurred while uploading the sample PDF: " + err.statusCode || err);
      } finally {
        res.redirect("/");
      }
    } else {
      res.redirect("/");
    }
  } else {
    req.session.token = null;
    req.session.user = null;
    res.redirect("/login");
  }
});

// GET /login
//
// Rendering the login page must not have any side effect. Browsers issue
// involuntary GET requests (for example for /favicon.ico) that the auth
// middleware redirects here, so clearing the session in this handler would
// silently log the user out whenever such a request happens to be resolved
// against a session that is momentarily seen as logged out. Logging out is an
// explicit action and lives in its own POST /logout route below.
router.get("/login", (req, res) => {
  res.render("login");
});

// POST /logout
router.post("/logout", (req, res) => {
  req.session.user = null;
  req.session.token = null;
  res.redirect("/login");
});

function uploadSamplePDF(user, filename) {
  var file = fs.readFileSync(filename);

  return util.upload(
    {
      buffer: file,
      originalname: path.basename(filename),
    },
    user
  );
}

module.exports = router;
