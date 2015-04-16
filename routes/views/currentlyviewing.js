var Record = require('../../record.js').Record;
var view_util = require('./view_util');

// Counter with short lifetime - for 'currently viewing'
exports = module.exports = function(req, res) {
  var sess_key = req.params.account + '_' + req.query.key;
  if (req.session[sess_key]) {
    // TODO this has to expire sometime!
    // TODO this should return count
    view_util.success(res, -1);
    return;
  }

  req.session[sess_key] = true;
  req.session.save();

  // Record against multiple timeframes.
  var helper = new Helper(req, res);

  // 1 minute
  if (req.params.account === 'caffe7') {
    // 1 week
    helper.createRecord(24 * 60 * 7).then(function(count) {
      view_util.success(res, count);
    }, function(reason) {
      view_util.error(res, reason);
    });
  } else {
    helper.createRecord(1).then(function(count) {
      view_util.success(res, count);
    }, function(reason) {
      view_util.error(res, reason);
    });
  }

  // 1 day
  // helper.createRecord(24 * 60);

  // 1 month
  // helper.createRecord(24 * 60 * 30);

  // 1 year
  // helper.createRecord(24 * 60 * 365);
};

function Helper(req, res) {
  Helper.prototype.createRecord = function(expireInMinutes) {
    var recordObj = new Record(req, 'viewing');
    recordObj.setTtlMinutes(expireInMinutes);

    // TODO send back stats for everything?
    return recordObj.save()
  };
}
