var express = require("express");
var router = express.Router();
var request = require("request");
var multer = require("multer");
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });
var jwt = require("jsonwebtoken");
var db = require("../db");
var config = require("../config");

// POST /upload
router.post("/", upload.single("file"), (req, res) => {
  var file = req.file;
  let { user } = req;
  if (!file) {
    return res.redirect("/");
  }

  request(
    {
      method: "POST",
      url: `${config.pspdfkitBaseUrl}/api/document`,
      headers: {
        Authorization: `Token token=${config.pspdfkitAuthToken}`,
        "Content-Type": "application/pdf"
      },
      body: file.buffer
    },
    (err, remoteResponse, remoteBody) => {
      if (err) {
        return onError(res, err);
      } else if (remoteResponse.statusCode !== 200) {
        return onRemoteError(res, remoteResponse);
      }

      var data = JSON.parse(remoteBody).data;

      var pspdfkitToken = jwt.sign(
        { document_id: data.document_id, permissions: ["cover-image"] },
        config.pspdfkitJWTKey,
        {
          algorithm: "RS256",
          expiresIn: 10 * 365 * 24 * 60 * 60 // 10 years
        }
      );
      var cover_url = `${config.pspdfkitBaseUrl}/documents/${data.document_id}/cover?width=200&jwt=${pspdfkitToken}`;

      db.docs.set(data.document_id, {
        id: data.document_id,
        title: file.originalname,
        cover_url: cover_url,
        owner: user,
        access: []
      });

      res.redirect("/");
    }
  );
});

// error handlers
function onError(res, err) {
  res.render("error", {
    message: err.message
  });
}

function onRemoteError(res, remoteResponse) {
  res.render("error", {
    message: JSON.stringify(remoteResponse, null, "\t")
  });
}

module.exports = router;
