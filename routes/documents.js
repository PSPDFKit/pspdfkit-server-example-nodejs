var router = require("express").Router();
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
  let instant, aiAssistant;

  if ("instant" in req.query) {
    instant = req.query.instant === "true";
  } else if ("instant" in req.cookies) {
    instant = req.cookies.instant === "true";
  } else {
    instant = true;
  }

  aiAssistant = "aiAssistant" in req.query ? req.query.aiAssistant === "true" : false;

  return showDocument(res, req.params.id, user, null, instant, aiAssistant);
});

// GET /d/:id/:layer
router.get("/d/:id/:layer", (req, res) => {
  let { user } = req;
  let layer = req.params.layer;
  let instant, aiAssistant;

  if ("instant" in req.query) {
    instant = req.query.instant === "true";
  } else if ("instant" in req.cookies) {
    instant = req.cookies.instant === "true";
  } else {
    instant = true;
  }

  aiAssistant = "aiAssistant" in req.query ? req.query.aiAssistant === "true" : false;

  return showDocument(res, req.params.id, user, layer, instant, aiAssistant);
});

async function showDocument(res, document_id, user, layer, instant, aiAssistant) {
  let doc = db.docs.get(document_id);

  if (util.hasAccess(user, doc)) {
    let layers = await util.getDocumentLayers(doc.id);
    var pspdfkitToken = util.getPSPDFKitToken(doc.id, layer);
    var aiJwt = util.getAIAssistantToken(doc.id, user);

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
      aiJwt: aiJwt,
      instant: instant,
      aiAssistant: aiAssistant,
    });
  } else {
    res.redirect("/");
  }
}

// GET /d/:id/delete
router.get("/delete/:id", async (req, res) => {
  let { user } = req;
  let document_id = req.params.id;
  let doc = db.docs.get(document_id);

  if (doc.owner === user) {
    try {
      await util.deleteDocument(document_id);
    } catch (err) {
      console.log("An error occurred while deleting the PDF: " + err.statusCode || err);
    } finally {
      res.redirect("/");
    }
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
