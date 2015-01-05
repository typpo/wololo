var Record = require('../../record.js').Record;

// Generic counter with longer lifetime.
exports = module.exports = function(req, res) {
  // 'name' param allows different events with individual lifetimes, eg.
  // 'purchase', 'like', and so on.
  var recordObj = new Record(req, 'event', ['name', 'ttl']);

  recordObj.save().then(function() {
    view_util.success(res);
  }, function(reason) {
    view_util.error(res, reason);
  });
};
