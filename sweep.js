var record = require('./record');
var redis = require('redis');
var client = redis.createClient();

function startSweep() {
  // Use database 2.
  client.select(2, function() {
    sweep();
    // Every minute.
    setInterval(sweep, 30 * 1000);
  });
}

function sweep() {
  console.log('Sweeping');
  client.keys('timer:*', function(err, results) {
    if (err) {
      console.error('CRITICAL: Sweep failed - timer:* errored.');
      return;
    }

    results.forEach(function(timerKey) {
      var now = +new Date();
      client.zrangebyscore([timerKey, 0, now], function(err, results) {
        if (err) {
          // TODO handle or record this, it means a timer won't be executed
          // properly (ie. counter isn't decrementedon time)
          console.error('Could not decrement counter for timerKey', timerKey);
          return;
        }
        results.forEach(function(countKey) {
          // Decrement counter for anything with a stored expiration that has
          // passed.
          console.log('Decrementing zrangebyscore result: ', countKey);
          client.decr(countKey, function(err, newval) {
            if (err) {
              // TODO handle or record this, it means a timer won't be executed
              // properly (ie. counter isn't decrementedon time)
              console.error('Could not decrement counter for timerKey', timerKey);
              return;
            }

            if (newval <= 0) {
              // Remove if there's nothing left.
              client.del(countKey);
              client.del(timerKey);
              console.log('Removing', countKey, 'and', timerKey);
            }
          });
        }); // forEach
      }); // client.zrangebyscore
    }); // forEach
  }); // client.keys
}

exports = module.exports = {
  startSweep: startSweep,
  sweep: sweep,
};
