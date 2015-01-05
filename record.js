var Q = require('q');
var redis = require('redis');
var client = redis.createClient();

// Default required fields.
var REQUIRED_FIELDS = ['key', 'category_key'];

// Default number of minutes for each impression to last.
var RECORD_LIFETIME_MINUTES = 1;

function Record(req, prefix, required_fields) {
  var me = this;
  var lifetime_in_minutes;
  var required_fields = _.extend(REQUIRED_FIELDS, required_fields);

  Record.prototype.save = function() {
    var deferred = Q.defer();
    if (!prefix) {
      console.error('Record prefix is required for all records. ' +
                    'Is there a route that does not pass a prefix?');
      // TODO might be a better way to create autoreject deferred with err.
      deferred.reject('This record could not be stored due to an error in ' +
                      'route implementation.');
      return deferred.promise;
    }

    var missingFields = me.getMissingFields_(req);
    if (missingFields.length > 0) {
      deferred.reject('Missing required fields: ' + missingFields.join(', '));
      return deferred.promise;
    }

    // It's a valid request; handle it.
    me.lifetime_in_minutes = RECORD_LIFETIME_MINUTES || req.query.lifetime;
    return me.recordKeys_(req.query.key, req.query.category_key);
  };

  Record.prototype.getMissingFields_ = function(req) {
    var missing = [];
    for (var i in REQUIRED_FIELDS) {
      var field = REQUIRED_FIELDS[i];
      if (!req.query[field]) {
        missing.push(field);
      }
    }
    return missing;
  };

  Record.prototype.recordKeys_ = function(key, cat_key) {
    var deferred = Q.defer();
    var countKey = getCountKey(prefix, key, cat_key);
    var timerKey = getTimerKey(prefix, key, cat_key);
    var expireAt = me.addMinutes_(new Date(), me.lifetime_in_minutes);
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

  Record.prototype.addMinutes_ = function(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  };
}

function getCountKey(prefix, key, cat_key) {
  return 'count:' + prefix + ':' + key + ':' + cat_key;
};

function getTimerKey(prefix, key, cat_key) {
  return 'timer:' + prefix + ':' + key + ':' + cat_key;
};

module.exports = {
  Record: Record,
  getCountKey: getCountKey,
  getTimerKey: getTimerKey,
};
