var redis = require('redis');
var client = redis.createClient();

exports = module.exports = function() {
  setInterval(doSweep, 60*1000);
};

function doSweep() {
  // Try to clean up. But this is not guaranteed to happen.
  // TODO if timeout works, can just decr countkey. This is the cleanup
  // function that works whenever.
  var timerKey = me.getTimerKey_(key, cat_key);
  var now = +new Date();

  client.zrangebyscore([timerKey, 0, now], function(err, results) {
    if (err) {
      // TODO handle this?
      return;
    }
    results.forEach(function(countKey) {
      console.log('zrangebysco result: ', countKey);
      client.decr(countKey);
    });
  });
}
