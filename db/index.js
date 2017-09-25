var dirty = require("dirty");

module.exports = {
  docs: dirty("db/docs.db"),
  users: dirty("db/users.db")
};
