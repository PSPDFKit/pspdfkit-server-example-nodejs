var jwt = require("jsonwebtoken");
var db = require("../db");
var config = require("../config");
var request = require("request");

var util = {
  login: user => {
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
    document.owner == user || document.access.some(x => user == x),
  getPSPDFKitToken: document_id =>
    jwt.sign(
      {
        document_id: document_id,
        permissions: ["read-document", "edit-annotations", "download"]
      },
      config.pspdfkitJWTKey,
      {
        algorithm: "RS256",
        expiresIn: 10 * 365 * 24 * 60 * 60 // 10yrs
      }
    ),
  shareDocument: (user, document_id, users) => {
    if (util.hasAccess(user, db.docs.get(document_id))) {
      db.docs.update(document_id.toString(), document => {
        document.access = users;
        return document;
      });
      return true;
    }
    return false;
  },
  upload: function upload(file, user, callback) {
    // make a POST request to the PSPDFKit Server api endpoint "api/documents[/#document_id]" to upload a new document
    request(
      {
        method: "POST",
        url: `${config.pspdfkitInternalUrl}/api/documents`,
        headers: {
          Authorization: `Token token=${config.pspdfkitAuthToken}`,
          "Content-Type": "application/pdf"
        },
        body: file.buffer
      },
      (err, remoteResponse, remoteBody) => {
        if (err) {
          return callback(err);
        } else if (remoteResponse.statusCode !== 200) {
          return callback(remoteResponse);
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
        var cover_url = `${config.pspdfkitExternalUrl}/documents/${data.document_id}/cover?width=200&jwt=${pspdfkitToken}`;

        var uploadData = {
          id: data.document_id,
          title: file.originalname,
          cover_url: cover_url,
          owner: user,
          access: []
        };

        db.docs.set(data.document_id, uploadData);

        callback(null, uploadData);
      }
    );
  },
  deleteDocument: function upload(document_id, callback) {
    // Deletion of a document is done on two steps:
    //  1. We delete the document from PSPDFKit Server using the DELETE endpoint.
    //  2. When the deletion was successful, we also remove the database entry.
    //
    // This way, we can be sure that we don't remove a document from our database that is not yet removed from the Server.
    request(
      {
        method: "DELETE",
        url: `${config.pspdfkitInternalUrl}/api/documents/${document_id}`,
        headers: {
          Authorization: `Token token=${config.pspdfkitAuthToken}`
        }
      },
      (err, remoteResponse, remoteBody) => {
        if (err) {
          callback(err);
        } else if (remoteResponse.statusCode == 200) {
          db.docs.rm(document_id);
          callback(null);
        } else {
          callback(remoteBody);
        }
      }
    );
  },
  userDocuments: user => {
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
  }
};

module.exports = util;
