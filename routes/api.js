var router = require("express-promise-router")();
var jwt = require("jsonwebtoken");
var config = require("../config");
var util = require("../util");
var db = require("../db");
var basicAuth = require("basic-auth");
var request = require("request-promise-native");
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

var auth = () => {
  return (req, res, next) => {
    var user = basicAuth(req);

    if (user) {
      let { name } = user;

      req.user = name;
      next();
    } else {
      res.set("WWW-Authenticate", "Basic realm=Authorization Required");

      return res.sendStatus(401);
    }
  };
};

router.use("/api", auth());

router.get("/api/documents", async (req, res) => {
  let { user } = req;
  let documents = await Promise.all(
    util.userDocuments(user).map((d) => {
      return util.getDocumentLayers(d.id).then((layers) => {
        if (layers.length == 0) {
          // Layers are created lazily, when there is a change.
          // Ensure we always report at least the default layer.
          layers = [""];
        }

        var jwts = layers.map((layerName) =>
          util.getPSPDFKitToken(d.id, layerName)
        );

        return { id: d.id, title: d.title, layers: layers, tokens: jwts };
      });
    })
  );

  res.json({
    documents: documents,
  });
});

router.get("/api/document/:id", (req, res) => {
  let { user } = req;
  var doc = db.docs.get(req.params.id);

  if (util.hasAccess(user, doc)) {
    var pspdfkitToken = util.getPSPDFKitToken(doc.id, null);

    res.json({
      success: true,
      token: pspdfkitToken,
    });
  } else {
    res.json({
      success: false,
      message: "You don't have access to this document",
    });
  }
});

router.get("/api/document/:id/:layer", (req, res) => {
  let { user } = req;
  var doc = db.docs.get(req.params.id);

  if (util.hasAccess(user, doc)) {
    var pspdfkitToken = util.getPSPDFKitToken(doc.id, req.params.layer);

    res.json({
      success: true,
      token: pspdfkitToken,
    });
  } else {
    res.json({
      success: false,
      message: "You don't have access to this layer",
    });
  }
});

router.post("/api/share", (req, res) => {
  let { document_id, users } = req.body;
  let { user } = req;

  if (util.shareDocument(user, document_id, users)) {
    res.json({
      success: true,
      message: "Successfully shared document",
    });
  } else {
    res.json({
      success: false,
      message: "You don't have access to this document",
    });
  }
});

// POST /upload
router.post("/api/upload", upload.single("file"), async (req, res) => {
  var file = req.file;
  let { user } = req;

  if (!file) {
    return res.sendStatus(400);
  }

  try {
    let body = await request({
      method: "POST",
      url: `${config.pspdfkitInternalUrl}/api/document`,
      headers: {
        Authorization: `Token token=${config.pspdfkitAuthToken}`,
        "Content-Type": "application/pdf",
      },
      body: file.buffer,
      simple: true,
    });
    var data = JSON.parse(body).data;

    var pspdfkitToken = jwt.sign(
      { document_id: data.document_id, permissions: ["cover-image"] },
      config.pspdfkitJWTKey,
      {
        algorithm: "RS256",
        expiresIn: "2h", // 2 hours
      }
    );
    var coverUrl = `${config.pspdfkitExternalUrl}/documents/${data.document_id}/cover?width=200&jwt=${pspdfkitToken}`;

    db.docs.set(data.document_id, {
      id: data.document_id,
      title: file.originalname,
      coverUrl,
      owner: user,
      access: [],
    });

    res.json({ success: true });
  } catch (err) {
    res.json({
      success: false,
      message: err.message,
    });
  }
});

module.exports = router;
