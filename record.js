var _ = require('underscore');
var Q = require('q');
var redis = require('redis');
var client = redis.createClient();

// Default required fields.
var REQUIRED_FIELDS = ['key'];

// Default number of minutes for each impression to last.
var DEFAULT_LIFETIME_MINUTES = 1;

function Record(req, prefix, required_fields) {
  var me = this;
  // TODO Grab TTL from database/configuration based on prefix or event name,
  // on a per-account basis.
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

    if (req.query.name) {
      // User has specified a name for this event, which we treat as a prefix.
      prefix = prefix + ':' + name;
    }

    // It's a valid request; handle it.
    lifetime_in_minutes = lifetime_in_minutes || req.query.lifetime ||
      DEFAULT_LIFETIME_MINUTES;
    return me.recordKeys_(req.query.key, req.query.category_key || 'default');
  };

  Record.prototype.setTtlMinutes = function(ttl) {
    lifetime_in_minutes = ttl;
  };

  Record.prototype.getMissingFields_ = function(req) {
    var missing = [];
    for (var i in required_fields) {
      var field = required_fields[i];
      if (!req.query[field]) {
        missing.push(field);
      }
    }
    return missing;
  };

  Record.prototype.recordKeys_ = function(key, cat_key) {
    var deferred = Q.defer();
    var countKey = getCountKey(prefix, key, cat_key, lifetime_in_minutes);
    var timerKey = getTimerKey(prefix, key, cat_key, lifetime_in_minutes);
    var expireAt = me.addMinutes_(new Date(), lifetime_in_minutes);
    client.multi()
      .incr(countKey)
      .zadd([timerKey, expireAt.getTime(), countKey])
      .exec(function(err, replies) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(replies[0]);
        }
      });
    return deferred.promise;
  };

  Record.prototype.addMinutes_ = function(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  };
}

// TODO keys should be namespaced by account.
function getCountKey(prefix, key, cat_key, ttl) {
  return 'count:' + prefix + ':' + key + ':' + cat_key + ':' + ttl;
};

function getTimerKey(prefix, key, cat_key, ttl) {
  return 'timer:' + prefix + ':' + key + ':' + cat_key + ':' + ttl;
};

module.exports = {
  Record: Record,
  getCountKey: getCountKey,
  getTimerKey: getTimerKey,
};
