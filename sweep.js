var redis = require('redis');
var client = redis.createClient();


function startSweep() {
  setInterval(sweep_, 60*1000);
}

function sweep_() {
  var timerKey = me.getTimerKey_(key, cat_key);
  var now = +new Date();

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

function getCountKey(key, cat_key) {
  return key + ':' + cat_key + ':count'
};

function getTimerKey(key, cat_key) {
  return key + ':' + cat_key + ':timer'
};

exports = module.exports = {
  startSweep: startSweep,
  getCountKey: getCountKey,
  getTimerKey: getTimerKey,
};
