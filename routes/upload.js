var express = require("express");
var router = express.Router();
var multer = require("multer");
var storage = multer.memoryStorage();
var uploadStorage = multer({ storage: storage });
var upload = require("../util").upload;

// POST /upload
router.post("/", uploadStorage.single("file"), (req, res) => {
  var file = req.file;
  let { user } = req;
  if (!file) {
    return res.redirect("/");
  }

  upload(file, user)
    .then(() => res.redirect("/"))
    .catch(error => onError(res, error));
});

// error handlers
function onError(res, err) {
  res.render("error", {
    message: err.message
  });
}

module.exports = router;
