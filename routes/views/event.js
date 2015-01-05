var Record = require('../../record.js').Record;

// Generic counter with longer lifetime.
exports = module.exports = function(req, res) {
  // TODO grab ttl from database/configuration.
  var recordObj = new Record(req, res, 'event', ['ttl']);
  recordObj.save();
};
