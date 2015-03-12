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

  var record_opts = {
    key: null,
    category_key: null,
    account: null,
  };

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

    record_opts.key = req.query.key;
    record_opts.category_key = req.query.category_key || 'default';
    record_opts.account = req.params.account;

    return me.recordKeys_();
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

  Record.prototype.recordKeys_ = function() {
    var deferred = Q.defer();
    var countKey = getCountKey(prefix, record_opts.account, record_opts.key,
                               record_opts.category_key, lifetime_in_minutes);
    var timerKey = getTimerKey(prefix, record_opts.account, record_opts.key,
                               record_opts.category_key, lifetime_in_minutes);
    var expireAt = me.addMinutes_(new Date(), lifetime_in_minutes);
    client.multi()
      .incr(countKey)
      .zadd([timerKey, expireAt.getTime(), countKey])
      .exec(function(err, replies) {
        if (err) {
          deferred.reject(err);
        } else {
          // Resolve with count.
          deferred.resolve(replies[0]);
        }
      });
    return deferred.promise;
  };

  Record.prototype.addMinutes_ = function(date, minutes) {
    return new Date(date.getTime() + minutes * 60000);
  };
}

function getCountKey(prefix, account, key, cat_key, ttl) {
  return 'count:' + prefix + ':' + account + ':' + key + ':' + cat_key + ':' + ttl;
};

function getTimerKey(prefix, account, key, cat_key, ttl) {
  return 'timer:' + prefix + ':' + account + ':' + key + ':' + cat_key + ':' + ttl + ':' +
    // Random part so that each view gets its own timer.
    (+new Date()) + '_' + (Math.floor(Math.random() * 1000));
};

module.exports = {
  Record: Record,
  getCountKey: getCountKey,
  getTimerKey: getTimerKey,
};
