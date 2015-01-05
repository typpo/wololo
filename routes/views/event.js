var Record = require('../../record.js').Record;

// Generic counter with longer lifetime.
exports = module.exports = function(req, res) {
  var recordObj = new Record(req, res, 'event', ['ttl']);
  recordObj.save();
};
