var keystone = require('keystone');
var Q = require('q');

var redis = require('redis');
var client = redis.createClient();

var REQUIRED_FIELDS = ['key', 'category_key'];

// Number of minutes for each impression to last.
var RECORD_LIFETIME_MINUTES = 1;

exports = module.exports = function(req, res) {
  var recordObj = new Record(req, res);
  recordObj.save();
};

function Record(req, res) {
  var me = this;

  Record.prototype.save = function() {
    var missingFields = me.getMissingFields_(req);
    if (missingFields.length > 0) {
      me.error_('Missing required fields: ' + missingFields.join(', '));
      return;
    }
    me.recordKeys_(req.query.key, req.query.category_key).then(function() {
      me.success_();
    }, function(reason) {
      me.error_(reason);
    });
  };

  Record.prototype.getMissingFields_ = function(req) {
    var missing = [];
    for (var i in REQUIRED_FIELDS) {
      var key = REQUIRED_FIELDS[i];
      if (!req.query[key]) {
        missing.push(key);
      }
    }
    return missing;
  };

  Record.prototype.recordKeys_ = function(key, cat_key) {
    var deferred = Q.defer();
    var countKey = me.getCountKey_(key, cat_key);
    var timerKey = me.getTimerKey_(key, cat_key);
    var expireAt = me.addMinutes_(new Date(), RECORD_LIFETIME_MINUTES);
    client.multi()
      .incr(countKey)
      .zadd([timerKey, expireAt.getTime(), countKey])
      .exec(function(err, replies) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve();
        }
      });
    return deferred.promise;
  };

  Record.prototype.success_ = function() {
    res.send({
      success: true,
    });
  };

  Record.prototype.error_ = function(msg) {
    res.send({
      success: false,
      message: msg,
    });
  };

  Record.prototype.addMinutes_ = function(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
  };
}
