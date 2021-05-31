var fs = require("fs");

module.exports = {
  // We need two config options for the PSPDFKit Servers URL, because one is called
  // from the Node.js app itself (internal) and one is called from the browser (external).
  // Most of the time PSPDFKIT_SERVER_INTERNAL_URL and PSPDFKIT_SERVER_EXTERNAL_URL should have the
  // same value, but having this 2 options makes it possible to work with Docker
  // links and allow running the example with docker-compose.
  //
  // When running this example with docker-compose, PSPDFKIT_SERVER_INTERNAL_URL should be the
  // Docker link name (https://docs.docker.com/compose/networking/#links) and PSPDFKIT_SERVER_EXTERNAL_URL
  // should be the public IP address of the machine running docker-compose or
  // https://localhost:5000 for development purpose.
  //
  pspdfkitInternalUrl:
    process.env.PSPDFKIT_SERVER_INTERNAL_URL || "http://localhost:5000",
  pspdfkitExternalUrl:
    process.env.PSPDFKIT_SERVER_EXTERNAL_URL || "http://localhost:5000",
  pspdfkitAuthToken: process.env.AUTH_TOKEN || "secret",
  pspdfkitJWTKey: fs.readFileSync("./config/jwt.pem"),
  secret: "DONT_USE_THIS_SECRET_IN_PRODUCTION",
};
