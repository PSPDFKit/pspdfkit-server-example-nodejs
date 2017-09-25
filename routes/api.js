var express = require("express");
var router = express.Router();
var jwt = require("jsonwebtoken");
var config = require("../config");
var util = require("../util");
var db = require("../db");
var basicAuth = require("basic-auth");
var request = require("request");
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

router.get("/api/documents", (req, res) => {
  let { user } = req;
  res.json({
    documents: util.userDocuments(user).map(d => {
      return { id: d.id, title: d.title };
    })
  });
});

router.get("/api/document/:id", (req, res) => {
  let { user } = req;
  var doc = db.docs.get(req.params.id);
  if (util.hasAccess(user, doc)) {
    var pspdfkitToken = util.getPSPDFKitToken(doc.id);
    res.json({
      success: true,
      token: pspdfkitToken
    });
  } else {
    res.json({
      success: false,
      message: "You dont have access to this document"
    });
  }
});

router.post("/api/share", (req, res) => {
  let { document_id, users } = req.body;
  let { user } = req;
  if (util.shareDocument(user, document_id, users)) {
    res.json({
      success: true,
      message: "Successfully shared document"
    });
  } else {
    res.json({
      success: false,
      message: "You dont have access to this document"
    });
  }
});

// POST /upload
router.post("/api/upload", upload.single("file"), (req, res) => {
  var file = req.file;
  let { user } = req;
  if (!file) {
    return res.sendStatus(400);
  }

  request(
    {
      method: "POST",
      url: `${config.pspdfkitInternalUrl}/api/document`,
      headers: {
        Authorization: `Token token=${config.pspdfkitAuthToken}`,
        "Content-Type": "application/pdf"
      },
      body: file.buffer
    },
    (err, remoteResponse, remoteBody) => {
      if (err) {
        res.json({
          success: false,
          message: err.message
        });
      } else if (remoteResponse.statusCode !== 200) {
        res.json({
          success: false,
          message: JSON.stringify(remoteResponse, null, "\t")
        });
      }

      var data = JSON.parse(remoteBody).data;

      var pspdfkitToken = jwt.sign(
        { document_id: data.document_id, permissions: ["cover-image"] },
        config.pspdfkitJWTKey,
        {
          algorithm: "RS256",
          expiresIn: "2h" // 2 hours
        }
      );
      var cover_url = `${config.pspdfkitExternalUrl}/documents/${data.document_id}/cover?width=200&jwt=${pspdfkitToken}`;

      db.docs.set(data.document_id, {
        id: data.document_id,
        title: file.originalname,
        cover_url: cover_url,
        owner: user,
        access: []
      });

      res.json({ success: true });
    }
  );
});

module.exports = router;
