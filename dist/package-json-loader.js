(function() {
  var PackageJSONLoader, fs;

  fs = require('fs');

  PackageJSONLoader = (function() {
    function PackageJSONLoader() {}

    PackageJSONLoader.load = function(cwd) {
      var e, error, path;
      path = cwd + '/package.json';
      if (!fs.existsSync(path)) {
        throw new Error(path + ' is not found.');
      }
      try {
        return require(path);
      } catch (error) {
        e = error;
        throw new Error(path + ': parse error.\n' + e.message);
      }
    };

    PackageJSONLoader.save = function(cwd, content) {
      var path;
      path = cwd + '/package.json';
      return fs.writeFileSync(path, JSON.stringify(content, null, 2) + '\n');
    };

    return PackageJSONLoader;

  })();

  module.exports = PackageJSONLoader;

}).call(this);
