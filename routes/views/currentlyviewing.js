var Record = require('../../record.js').Record;
var view_util = require('./view_util');

// Counter with short lifetime - for 'currently viewing'
exports = module.exports = function(req, res) {
  // Record against multiple timeframes.

  // 1 minute
  createRecord(1);

  // 1 day
  createRecord(24*60);

  // 1 week
  createRecord(24*60*7);

  // 1 month
  createRecord(24*60*30);

  // 1 year
  createRecord(24*60*365);
};

function createRecord(expireInMinutes) {
  var recordObj = new Record(req, 'viewing');
  recordObj.setTtlMinutes(expireInMinutes);

  recordObj.save().then(function() {
    view_util.success(res);
  }, function(reason) {
    view_util.error(res, reason);
  });
}
