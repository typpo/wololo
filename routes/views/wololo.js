var uglify = require('uglify-js');
var code = null;

exports = module.exports = function(req, res) {
  if (!code) {
    console.log('Minifying public js for the first time...');
    var files = ['public/js/lib/humane.js', 'public/js/wololo_external.js'];
    var result = uglify.minify(files);
    code = result.code;
  }
  res.send(code);
};
