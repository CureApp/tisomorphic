(function() {
  var Installer, PackageJSONLoader, WorkingDirectory, fs;

  fs = require('fs');

  PackageJSONLoader = require('./package-json-loader');

  WorkingDirectory = require('./working-directory');


  /**
  attach npm scripts to package.json
  
  @class Installer
   */

  Installer = (function() {

    /**
    add scripts and custom fields to package.json
    
    @method run
    @static
     */
    Installer.run = function() {
      var cwd;
      cwd = new WorkingDirectory().resolve();
      return new this(cwd).install();
    };


    /**
    @constructor
    @param {String} cwd current working directory
     */

    function Installer(cwd1) {
      this.cwd = cwd1;
      this.packageJSON = PackageJSONLoader.load(this.cwd);
    }


    /**
    attach scripts and custom fields to package.json
    @method install
    @public
     */

    Installer.prototype.install = function() {
      this.attachScripts();
      return PackageJSONLoader.save(this.cwd, this.packageJSON);
    };


    /**
    attach scripts
    @method attachScripts
    @private
     */

    Installer.prototype.attachScripts = function() {
      var existingScripts, newScripts, ref;
      newScripts = {
        'tisomorphic': 'tisomorphic'
      };
      existingScripts = (ref = this.packageJSON.scripts) != null ? ref : {};
      this.setNonExistingValues(existingScripts, newScripts);
      return this.packageJSON.scripts = existingScripts;
    };


    /**
    attach values to object
    @method setNonExistingValues
    @private
     */

    Installer.prototype.setNonExistingValues = function(original, newObj) {
      var key, results, value;
      if (original == null) {
        original = {};
      }
      if (newObj == null) {
        newObj = {};
      }
      results = [];
      for (key in newObj) {
        value = newObj[key];
        if (!(original[key] == null)) {
          continue;
        }
        console.log("appending " + key + ": '" + value + "' to package.json");
        results.push(original[key] = value);
      }
      return results;
    };

    return Installer;

  })();

  module.exports = Installer;

}).call(this);
