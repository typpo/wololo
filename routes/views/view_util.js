// API response boilerplate.
exports = module.exports = {
 success: function(res) {
    res.send({
      success: true,
    });
  };

  error: function(res, msg) {
    res.send({
      success: false,
      message: msg,
    });
  };
};
