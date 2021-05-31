var jwt = require("jsonwebtoken");
var db = require("../db");
var config = require("../config");
var request = require("request-promise-native");

var util = {
  login: (user) => {
    if (user) {
      if (!db.users.get(user)) {
        // save user in db
        db.users.set(user, { name: user });
      }

      return true;
    } else {
      return false;
    }
  },

  hasAccess: (user, document) =>
    document.owner == user || document.access.some((x) => user == x),
  getPSPDFKitToken: (document_id, layer) => {
    var claims = {
      document_id: document_id,
      permissions: ["read-document", "write", "download"],
    };

    if (layer) {
      claims.layer = layer;
    }

    return jwt.sign(claims, config.pspdfkitJWTKey, {
      algorithm: "RS256",
      expiresIn: 10 * 365 * 24 * 60 * 60, // 10yrs
    });
  },
  shareDocument: (user, document_id, users) => {
    if (util.hasAccess(user, db.docs.get(document_id))) {
      db.docs.update(document_id.toString(), (document) => {
        document.access = users;

        return document;
      });

      return true;
    }

    return false;
  },
  upload: function upload(file, user) {
    // make a POST request to the PSPDFKit Server api endpoint "api/documents[/#document_id]" to upload a new document
    return request({
      method: "POST",
      url: `${config.pspdfkitInternalUrl}/api/documents`,
      headers: {
        Authorization: `Token token=${config.pspdfkitAuthToken}`,
        "Content-Type": "application/pdf",
      },
      body: file.buffer,
      simple: true,
    }).then((remoteBody) => {
      var data = JSON.parse(remoteBody).data;
      var pspdfkitToken = jwt.sign(
        { document_id: data.document_id, permissions: ["cover-image"] },
        config.pspdfkitJWTKey,
        {
          algorithm: "RS256",
          expiresIn: 10 * 24 * 60 * 60, // 10 days
        }
      );
      var coverUrl = `${config.pspdfkitExternalUrl}/documents/${data.document_id}/cover?width=200&jwt=${pspdfkitToken}`;

      var uploadData = {
        id: data.document_id,
        title: file.originalname,
        coverUrl,
        owner: user,
        access: [],
      };

      db.docs.set(data.document_id, uploadData);

      return uploadData;
    });
  },
  deleteDocument: function upload(document_id) {
    // Deletion of a document is done on two steps:
    //  1. We delete the document from PSPDFKit Server using the DELETE endpoint.
    //  2. When the deletion was successful, we also remove the database entry.
    //
    // This way, we can be sure that we don't remove a document from our database that is not yet removed from the Server.
    return request({
      method: "DELETE",
      url: `${config.pspdfkitInternalUrl}/api/documents/${document_id}`,
      headers: {
        Authorization: `Token token=${config.pspdfkitAuthToken}`,
      },
      resolveWithFullResponse: true,
    }).then(() => {
      db.docs.rm(document_id);

      return;
    });
  },
  userDocuments: (user) => {
    let docs = [];

    db.docs.forEach((k, document) => {
      // When a record was deleted from the "db" in dirty it will be undefined
      if (document !== undefined) {
        if (util.hasAccess(user, document)) {
          docs.push(document);
        }
      }
    });

    return docs;
  },

  getDocumentLayers: (document_id) => {
    return request({
      method: "GET",
      url: `${config.pspdfkitInternalUrl}/api/documents/${document_id}/layers/`,
      headers: {
        Authorization: `Token token=${config.pspdfkitAuthToken}`,
      },
      json: true,
      simple: true,
    }).then((body) => {
      return body.data;
    });
  },
};

module.exports = util;
