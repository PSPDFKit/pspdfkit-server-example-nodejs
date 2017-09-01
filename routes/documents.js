var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var db = require("../db");
var config = require("../config");
var util = require("../util");

// GET /
router.get("/", (req, res) => {
  let { user } = req;
  let docs = util.userDocuments(user);

  res.render("index", { docs: docs, user: user });
});

// GET /d/:id
router.get("/d/:id", (req, res) => {
  let { user } = req;
  var doc = db.docs.get(req.params.id);

  if (util.hasAccess(user, doc)) {
    var pspdfkitToken = util.getPSPDFKitToken(doc.id);
    var instant;

    if ('instant' in req.query) {
      instant = req.query.instant === "true";
    } else if ('instant' in req.cookies) {
      instant = req.cookies.instant === "true";
    } else {
      instant = true;
    }

    // set the cookie
    res.cookie('instant', instant);

    res.render("show", {
      pspdfkitBaseUrl: config.pspdfkitBaseUrl,
      doc: doc,
      user: user,
      allUsers: db.users,
      hasAccess: util.hasAccess,
      jwt: pspdfkitToken,
      instant: instant
    });
  } else {
    res.redirect("/");
  }
});

router.post("/d/:document_id/users", (req, res) => {
  let { user } = req;
  let { document_id } = req.params;
  let users = req.body.users || [];
  if (util.shareDocument(user, document_id, users)) {
    res.redirect(`/d/${document_id}`);
  } else {
    res.redirect("/");
  }
});

module.exports = router;
