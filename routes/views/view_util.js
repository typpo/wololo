// API response boilerplate.
exports = module.exports = {
 success: function(res, count) {
    res.send(wrapWololoCb({
      success: true,
      count: count,
    }));
  },

  error: function(res, msg) {
    res.send(wrapWololoCb({
      success: false,
      message: msg,
    }));
  },
};

function wrapWololoCb(obj) {
  var str = JSON.stringify(obj);
  return 'wololoCb(' + str + ')';
}
