var express = require("express");
var router = express.Router();
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
router.post("/d/change_layer", (req, res) => {
  let { layer, document_id } = req.body;
  res.redirect(`/d/${document_id}/${layer}`);
});

// GET /d/:id
router.get("/d/:id", (req, res) => {
  let { user } = req;
  let instant;

  if ("instant" in req.query) {
    instant = req.query.instant === "true";
  } else if ("instant" in req.cookies) {
    instant = req.cookies.instant === "true";
  } else {
    instant = true;
  }

  showDocument(res, req.params.id, user, null, instant);
});

// GET /d/:id
router.get("/d/:id/:layer", (req, res) => {
  let { user } = req;
  let layer = req.params.layer;
  let instant;

  if ("instant" in req.query) {
    instant = req.query.instant === "true";
  } else if ("instant" in req.cookies) {
    instant = req.cookies.instant === "true";
  } else {
    instant = true;
  }
  showDocument(res, req.params.id, user, layer, instant);
});

function showDocument(res, document_id, user, layer, instant) {
  let doc = db.docs.get(document_id);

  util.getDocumentLayers(doc.id).then(layers => {
    if (util.hasAccess(user, doc)) {
      var pspdfkitToken = util.getPSPDFKitToken(doc.id, layer);

      !layers.includes("") && layers.push("");

      // set the cookie
      res.cookie("instant", instant);

      res.render("show", {
        pspdfkitExternalUrl: config.pspdfkitExternalUrl,
        doc: doc,
        user: user,
        layer: layer || "",
        layers: layers,
        allUsers: db.users,
        hasAccess: util.hasAccess,
        jwt: pspdfkitToken,
        instant: instant
      });
    } else {
      res.redirect("/");
    }
  });
}

// GET /d/:id/delete
router.get("/delete/:id", (req, res) => {
  let { user } = req;
  let document_id = req.params.id;
  let doc = db.docs.get(document_id);
  if (doc.owner === user) {
    util
      .deleteDocument(document_id)
      .then(() => {
        res.redirect("/");
      })
      .catch(err => {
        console.log("An error occurred while deleting the PDF: " + err.statusCode || err);
        res.redirect("/");
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
