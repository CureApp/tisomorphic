(function() {
  var PackageJSONLoader, Tisomorphic, WorkingDirectory, _____, fs,
    indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

  _____ = require('debug')('tisomorphic');

  fs = require('fs');

  PackageJSONLoader = require('./package-json-loader');

  WorkingDirectory = require('./working-directory');


  /**
  enable titanium to require npm packages
  
  @class Tisomorphic
   */

  Tisomorphic = (function() {

    /**
    entry. call Tisomorphic#run()
    
    @method run
    @public
    @static
     */
    Tisomorphic.run = function(cwd) {
      cwd = new WorkingDirectory().resolve();
      return new this(cwd).run();
    };


    /**
    @constructor
    @param {String} cwd current working directory, expecting project root
     */

    function Tisomorphic(cwd1) {
      var externals, mod, ref, ref1;
      this.cwd = cwd1;
      _____('working directory: %s', this.cwd);
      this.packageJSON = PackageJSONLoader.load(this.cwd);
      this.entryName = 'index.js';
      this.packageJSON.main = this.entryName;
      externals = (ref = (ref1 = this.packageJSON.titaniumifier) != null ? ref1.externals : void 0) != null ? ref : [];
      this.modules = (function() {
        var results;
        results = [];
        for (mod in this.packageJSON.dependencies) {
          if (indexOf.call(externals, mod) < 0) {
            results.push(mod);
          }
        }
        return results;
      }).call(this);
      _____('modules to make isomorphic: \n\t%s\n', this.modules.join('\n\t'));
      this.tmpdir = this.cwd + '/.tisomorphic-' + Math.random().toString();
      this.libdir = this.cwd + '/app/lib';
    }


    /**
    1. confirm the project is on Alloy framework
    2. create tmp dir for titaniumifier to work
    3. create an entry file which requires all the modules in dependencies
    4. titaniumifier.packer.pack()
    5. locate the created file and create entries for modules
    5. cleanup
    
    @method run
     */

    Tisomorphic.prototype.run = function() {
      process.on('exit', (function(_this) {
        return function() {
          return _this.clearTmpDir();
        };
      })(this));
      if (!this.isAlloy()) {
        this.showWhatIsAlloyProject();
        return;
      }
      this.insertShimInfo();
      this.createTmpDir();
      this.createEntry();
      return this.pack().then((function(_this) {
        return function(bundled) {
          return _this.locateBundled(bundled);
        };
      })(this));
    };


    /**
    is Alloy project?
    @method isAlloy
    @private
    @return {Boolean}
     */

    Tisomorphic.prototype.isAlloy = function() {
      return fs.existsSync(this.libdir);
    };


    /**
    show guidance when cwd is not an alloy project
    @method showWhatIsAlloyProject
    @private
     */

    Tisomorphic.prototype.showWhatIsAlloyProject = function() {
      return console.error("\n--- Error in running tisomorphic ---\n\napp/lib must exist as a directory.\n\n");
    };


    /**
    insert shim info to package.json
    
    @method insertShimInfo
    @private
     */

    Tisomorphic.prototype.insertShimInfo = function() {
      var base;
      if ((base = this.packageJSON).titanium == null) {
        base.titanium = {};
      }
      return this.packageJSON.titanium.superagent = 'ti-superagent';
    };


    /**
    create a temporary directory with package.json and node_modules symlinked for titaniumifier to pack
    
    @method createTmpDir
    @private
     */

    Tisomorphic.prototype.createTmpDir = function() {
      var file, i, len, ref;
      _____('creating temporary directory: %s', this.tmpdir);
      fs.mkdirSync(this.tmpdir);
      _____('copying package.json into temporary directory');
      fs.writeFileSync(this.tmpdir + '/package.json', JSON.stringify(this.packageJSON));
      _____('creating node_modules into temporary directory');
      fs.mkdirSync(this.tmpdir + '/node_modules');
      _____('symlinking node_modules/* into temporary directory');
      ref = fs.readdirSync(this.cwd + '/node_modules');
      for (i = 0, len = ref.length; i < len; i++) {
        file = ref[i];
        _____('symlinking node_modules/%s', file);
        fs.symlinkSync(this.cwd + '/node_modules/' + file, this.tmpdir + '/node_modules/' + file);
      }
      if (!fs.existsSync(this.tmpdir + '/node_modules/ti-superagent')) {
        _____('symlinking ti-superagent into node_modules');
        return fs.symlinkSync(__dirname + '/../node_modules/ti-superagent', this.tmpdir + '/node_modules/ti-superagent');
      }
    };


    /**
    clear the temporary directory
    @method clearTmpDir
    @private
     */

    Tisomorphic.prototype.clearTmpDir = function() {
      var file, i, len, ref;
      _____('unlinking entry file in tmpdir if exists');
      this.rm(this.tmpdir + '/' + this.entryName);
      _____('unlinking package.json in tmpdir if exists');
      this.rm(this.tmpdir + '/package.json');
      if (fs.existsSync(this.tmpdir + '/node_modules')) {
        _____('unlinking node_modules/* in tmpdir if exists');
        ref = fs.readdirSync(this.tmpdir + '/node_modules');
        for (i = 0, len = ref.length; i < len; i++) {
          file = ref[i];
          this.rm(this.tmpdir + '/node_modules/' + file);
        }
        _____('removing dir: %s', this.tmpdir + '/node_modules');
        this.rmdir(this.tmpdir + '/node_modules');
      }
      _____('removing dir: %s', this.tmpdir);
      return this.rmdir(this.tmpdir);
    };


    /**
    remove file if exists
    @method rm
    @param {String} path
    @private
     */

    Tisomorphic.prototype.rm = function(path) {
      var e, error;
      try {
        if (fs.existsSync(path)) {
          return fs.unlinkSync(path);
        }
      } catch (error) {
        e = error;
      }
    };


    /**
    remove empty dir if exists
    @method rmdir
    @param {String} path
    @private
     */

    Tisomorphic.prototype.rmdir = function(path) {
      var e, error;
      try {
        if (fs.existsSync(path)) {
          return fs.rmdirSync(path);
        }
      } catch (error) {
        e = error;
      }
    };


    /**
    create js entry file for titaniumifier
    @method createEntry
    @private
     */

    Tisomorphic.prototype.createEntry = function() {
      var code, i, len, mod, ref;
      code = 'module.exports = {\n';
      ref = this.modules;
      for (i = 0, len = ref.length; i < len; i++) {
        mod = ref[i];
        code += "  '" + mod + "': require('" + mod + "'),\n";
      }
      code += '};\n';
      _____('creating entry file: %s', this.tmpdir + '/' + this.entryName);
      _____('its code: \n\n%s\n\n', code);
      return fs.writeFileSync(this.tmpdir + '/' + this.entryName, code);
    };


    /**
    pack tmpdir into one js file using titaniumifier.packer.pack
    @method pack
    @return {Promise(Buffer)} bundled js source code
    @private
     */

    Tisomorphic.prototype.pack = function() {
      var Promise, cfg, pack, packed;
      pack = require('titaniumifier').packer.pack;
      cfg = {};
      _____('start titaniumifier.packer.pack()');
      packed = pack(this.tmpdir, cfg);
      Promise = packed.constructor;
      return Promise.props(packed).then(function(v) {
        return v.source;
      });
    };


    /**
    locate the bundled file and create entries for modules into app/lib
    @method pack
    @param {Buffer} source
    @private
     */

    Tisomorphic.prototype.locateBundled = function(source) {
      var bundleFileName, content, i, len, mod, ref, results;
      bundleFileName = 'tisomorphic-modules';
      _____('locating tisomorphic-modules.js into %s', this.libdir);
      fs.writeFileSync(this.libdir + '/' + bundleFileName + '.js', source);
      ref = this.modules;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        mod = ref[i];
        content = "module.exports = require('" + bundleFileName + "')['" + mod + "'];\n";
        _____('creating module entry: %s.js into %s', mod, this.libdir);
        results.push(fs.writeFileSync(this.libdir + ("/" + mod + ".js"), content));
      }
      return results;
    };

    return Tisomorphic;

  })();

  module.exports = Tisomorphic;

}).call(this);
