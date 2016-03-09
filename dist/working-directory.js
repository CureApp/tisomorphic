(function() {
  var WorkingDirectory, fs, path;

  fs = require('fs');

  path = require('path');

  WorkingDirectory = (function() {
    function WorkingDirectory() {
      this.path = process.cwd();
    }

    WorkingDirectory.prototype.resolve = function() {
      if (this.inNodeModules() && this.upperPackageJSON()) {
        this.path = path.normalize(this.path + '/../..');
      }
      return this.path;
    };

    WorkingDirectory.prototype.inNodeModules = function() {
      return path.basename(path.normalize(this.path + '/..')) === 'node_modules';
    };

    WorkingDirectory.prototype.upperPackageJSON = function() {
      var upperPackagePath;
      upperPackagePath = path.normalize(this.path + '/../../package.json');
      return fs.existsSync(upperPackagePath);
    };

    return WorkingDirectory;

  })();

  module.exports = WorkingDirectory;

}).call(this);
