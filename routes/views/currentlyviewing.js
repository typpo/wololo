var Record = require('../../record.js').Record;

// Counter with short lifetime - for 'currently viewing'
exports = module.exports = function(req, res) {
  var recordObj = new Record(req, res, 'viewing');
  recordObj.save();
};
