var Record = require('../../record.js').Record;
var view_util = require('./view_util');

// Counter with short lifetime - for 'currently viewing'
exports = module.exports = function(req, res) {
  var recordObj = new Record(req, 'viewing');

  recordObj.save().then(function() {
    view_util.success(res);
  }, function(reason) {
    view_util.error(res, reason);
  });
};
