var jwt = require("jsonwebtoken");
var db = require("../db");
var config = require("../config");
var uuidv4 = require("crypto").randomUUID;

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

  hasAccess: (user, document) => document.owner == user || document.access.some((x) => user == x),
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
      allowInsecureKeySizes: true,
    });
  },
  getAIAssistantToken: (document_id, user_id) => {
    var claims = {
      document_id: document_id,
      permissions: ["read-document", "write", "download"],
      user_id: user_id,
    };

    return jwt.sign(claims, config.aiaJWTKey, {
      algorithm: "RS256",
      expiresIn: 10 * 365 * 24 * 60 * 60, // 10yrs
      allowInsecureKeySizes: true,
    });
  },
  generateSessionId: () => uuidv4(),
  checkAIAssistantHealth: async () => {
    try {
      const response = await fetch(`${config.aiaInternalUrl}/healthcheck`, {
        method: "GET",
        headers: {
          Authorization: `Token token=${config.aiaAuthToken}`,
          Accept: "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("AI Assistant health check failed:", error);
      return false;
    }
  },
  ingestDocument: async (document_id, layer, fileHash) => {
    const endpoint =
      layer && layer !== ""
        ? `${config.aiaInternalUrl}/server/api/v1/documents/${document_id}/layers/${layer}/ingest/${fileHash}`
        : `${config.aiaInternalUrl}/server/api/v1/documents/${document_id}/ingest/${fileHash}`;

    const response = await fetch(endpoint, {
      method: "GET",
      headers: {
        Authorization: `Token token=${config.pspdfkitAuthToken}`,
      },
      resolveWithFullResponse: true,
    });

    if (response.ok) {
      return { success: true, message: "Document ingestion complete" };
    } else {
      throw new Error(`Failed to ingest document. Status code: ${response.status}`);
    }
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
  upload: async (file, user) => {
    // make a POST request to the Nutrient Document Engine api endpoint "api/documents[/#document_id]" to upload a new document
    const response = await fetch(`${config.pspdfkitInternalUrl}/api/documents`, {
      method: "POST",
      headers: {
        Authorization: `Token token=${config.pspdfkitAuthToken}`,
        "Content-Type": "application/pdf",
      },
      body: file.buffer,
    });

    if (response.ok) {
      var data = (await response.json()).data;

      var pspdfkitToken = jwt.sign(
        { document_id: data.document_id, permissions: ["cover-image"] },
        config.pspdfkitJWTKey,
        {
          algorithm: "RS256",
          expiresIn: 10 * 24 * 60 * 60, // 10 days
          allowInsecureKeySizes: true,
        }
      );
      var coverUrl = `${config.pspdfkitExternalUrl}/documents/${data.document_id}/cover?width=200&jwt=${pspdfkitToken}`;

      var uploadData = {
        id: data.document_id,
        title: file.originalname,
        coverUrl,
        owner: user,
        access: [],
        sourcePdfSha256: data.sourcePdfSha256,
      };

      db.docs.set(data.document_id, uploadData);

      return uploadData;
    } else {
      throw new Error(`Failed to upload document. Status code: ${response.status}`);
    }
  },
  deleteDocument: function upload(document_id) {
    // Deletion of a document is done on two steps:
    //  1. We delete the document from Nutrient Document Engine using the DELETE endpoint.
    //  2. When the deletion was successful, we also remove the database entry.
    //
    // This way, we can be sure that we don't remove a document from our database that is not yet removed from Document Engine.
    return fetch(`${config.pspdfkitInternalUrl}/api/documents/${document_id}`, {
      method: "DELETE",
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

  getDocumentLayers: async (document_id) => {
    const response = await fetch(
      `${config.pspdfkitInternalUrl}/api/documents/${document_id}/layers/`,
      {
        method: "GET",
        headers: {
          Authorization: `Token token=${config.pspdfkitAuthToken}`,
        },
      }
    );

    if (response.ok) {
      return (await response.json()).data;
    } else {
      throw new Error(`Failed to retrieve document layers. Status code: ${response.status}`);
    }
  },
};

module.exports = util;
