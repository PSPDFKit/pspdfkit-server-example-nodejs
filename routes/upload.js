var router = require("express-promise-router")();
var multer = require("multer");
var storage = multer.memoryStorage();
var uploadStorage = multer({ storage: storage });
var upload = require("../util").upload;

// POST /upload
router.post("/", uploadStorage.single("file"), async (req, res) => {
  var file = req.file;
  let { user } = req;

  if (!file) {
    return res.redirect("/");
  }

  try {
    await upload(file, user);
    res.redirect("/");
  } catch (err) {
    onError(res, err);
  }
});

// error handlers
function onError(res, err) {
  res.render("error", {
    message: err.message,
  });
}

module.exports = router;
