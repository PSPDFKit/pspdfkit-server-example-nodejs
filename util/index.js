var jwt = require('jsonwebtoken');
var db = require('../db');
var config = require('../config');

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
  hasAccess: (user, document) => document.owner == user || document.access.some(x => user == x),
  getPSPDFKitToken: document_id => jwt.sign(
    {
      document_id: document_id,
      permissions: ['read-document', 'edit-annotations', 'download']
    },
    config.pspdfkitJWTKey,
    {
      algorithm: 'RS256',
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
  userDocuments: (user) => {
    let docs = [];

    db.docs.forEach((k, document) => {
      if (util.hasAccess(user, document)) {
        docs.push(document);
      }
    });

    return docs;
  }
}

module.exports = util;
