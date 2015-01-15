// API response boilerplate.
exports = module.exports = {
 success: function(res, count) {
    res.send({
      success: true,
      count: count,
    });
  },

  error: function(res, msg) {
    res.send({
      success: false,
      message: msg,
    });
  },
};
