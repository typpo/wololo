var record = require('./record');
var redis = require('redis');
var client = redis.createClient();

function startSweep() {
  setInterval(sweep_, 60*1000);
}

function sweep_() {
  var now = +new Date();

  // TODO!! get all timer keys
  // client.keys('timer:')

  //var timerKey = record.getTimerKey(prefix, key, cat_key);

  client.zrangebyscore([timerKey, 0, now], function(err, results) {
    if (err) {
      // TODO handle or record this
      return;
    }
    results.forEach(function(countKey) {
      // Decrement counter for anything with a stored expiration that has passed.
      console.log('zrangebysco result: ', countKey);
      client.decr(countKey);
    });
  });
}

exports = module.exports = {
  startSweep: startSweep,
};
