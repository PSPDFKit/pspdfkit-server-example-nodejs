var fs = require("fs");

module.exports = {
  pspdfkitBaseUrl: process.env.BASE_URL || "http://localhost:5000",
  pspdfkitAuthToken: process.env.AUTH_TOKEN || "secret",
  pspdfkitJWTKey: fs.readFileSync("./config/jwt.pem"),
  secret: "DONT_USE_THIS_SECRET_IN_PRODUCTION"
};
