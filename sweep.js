var redis = require('redis');
var client = redis.createClient();

exports = module.exports = function() {
  setInterval(doSweep, 60*1000);
};

function doSweep() {
  var timerKey = me.getTimerKey_(key, cat_key);
  var now = +new Date();

  client.zrangebyscore([timerKey, 0, now], function(err, results) {
    // Decrement counter for anything with a stored expiration that has passed.
    if (err) {
      // TODO handle or record this
      return;
    }
    results.forEach(function(countKey) {
      console.log('zrangebysco result: ', countKey);
      client.decr(countKey);
    });
  });
}
