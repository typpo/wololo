var Record = require('../../record.js').Record;

// Generic counter with longer lifetime.
exports = module.exports = function(req, res) {
  // TODO grab ttl from database/configuration on per-account basis.
  var recordObj = new Record(req, 'event', ['ttl']);

  recordObj.save().then(function() {
    view_util.success(res);
  }, function(reason) {
    view_util.error(res, reason);
  });
};
