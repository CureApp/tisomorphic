

_____ = require('debug')('tisomorphic')
fs = require 'fs'
PackageJSONLoader = require './package-json-loader'
WorkingDirectory = require './working-directory'


###*
enable titanium to require npm packages

@class Tisomorphic
###
class Tisomorphic


    ###*
    entry. call Tisomorphic#run()

    @method run
    @public
    @static
    ###
    @run: (cwd) ->

        cwd = new WorkingDirectory().resolve()

        new @(cwd).run()


    ###*
    @constructor
    @param {String} cwd current working directory, expecting project root
    ###
    constructor: (@cwd) ->

        _____('working directory: %s', @cwd)

        @packageJSON = PackageJSONLoader.load(@cwd)

        @entryName = 'index.js'

        @packageJSON.main = @entryName

        externals = @packageJSON.titaniumifier?.externals ? []

        # module names written in package.json dependencies
        @modules = (mod for mod of @packageJSON.dependencies when mod not in externals)
        _____('modules to make isomorphic: \n\t%s\n', @modules.join('\n\t'))

        @tmpdir = @cwd + '/.tisomorphic-' + Math.random().toString()

        @libdir = @cwd + '/app/lib'



    ###*
    1. confirm the project is on Alloy framework
    2. create tmp dir for titaniumifier to work
    3. create an entry file which requires all the modules in dependencies
    4. titaniumifier.packer.pack()
    5. locate the created file and create entries for modules
    5. cleanup

    @method run
    ###
    run: ->

        process.on 'exit', => @clearTmpDir()

        unless @isAlloy()
            @showWhatIsAlloyProject()
            return

        @insertShimInfo()
        @createTmpDir()
        @createEntry()

        @pack().then (bundled) =>

            @locateBundled(bundled)



    ###*
    is Alloy project?
    @method isAlloy
    @private
    @return {Boolean}
    ###
    isAlloy: ->

        fs.existsSync(@libdir)


    ###*
    show guidance when cwd is not an alloy project
    @method showWhatIsAlloyProject
    @private
    ###
    showWhatIsAlloyProject: ->

        console.error """

            --- Error in running tisomorphic ---

            app/lib must exist as a directory.


        """

    ###*
    insert shim info to package.json

    @method insertShimInfo
    @private
    ###
    insertShimInfo: ->

        @packageJSON.titanium ?= {}
        @packageJSON.titanium.superagent = 'ti-superagent'


    ###*
    create a temporary directory with package.json and node_modules symlinked for titaniumifier to pack

    @method createTmpDir
    @private
    ###
    createTmpDir: ->

        _____('creating temporary directory: %s', @tmpdir)
        fs.mkdirSync @tmpdir

        _____('copying package.json into temporary directory')
        fs.writeFileSync(@tmpdir + '/package.json', JSON.stringify @packageJSON)

        _____('creating node_modules into temporary directory')
        fs.mkdirSync(@tmpdir + '/node_modules')

        _____('symlinking node_modules/* into temporary directory')
        for file in fs.readdirSync(@cwd + '/node_modules')
            _____('symlinking node_modules/%s', file)
            fs.symlinkSync(@cwd + '/node_modules/' + file, @tmpdir + '/node_modules/' + file)

        _____('symlinking ti-superagent into node_modules')
        fs.symlinkSync(__dirname + '/../node_modules/ti-superagent', @tmpdir + '/node_modules/ti-superagent')


    ###*
    clear the temporary directory
    @method clearTmpDir
    @private
    ###
    clearTmpDir: ->

        _____('unlinking entry file in tmpdir if exists')
        @rm(@tmpdir + '/' + @entryName)

        _____('unlinking package.json in tmpdir if exists')
        @rm(@tmpdir + '/package.json')

        _____('unlinking node_modules/* in tmpdir if exists')
        for file in fs.readdirSync(@tmpdir + '/node_modules')
            @rm(@tmpdir + '/node_modules/' + file)

        _____('removing dir: %s', @tmpdir + '/node_modules')
        @rmdir @tmpdir + '/node_modules'

        _____('removing dir: %s', @tmpdir)
        @rmdir @tmpdir


    ###*
    remove file if exists
    @method rm
    @param {String} path
    @private
    ###
    rm: (path) ->
        try
            fs.unlinkSync(path) if fs.existsSync(path)
        catch e


    ###*
    remove empty dir if exists
    @method rmdir
    @param {String} path
    @private
    ###
    rmdir: (path) ->
        try
            fs.rmdirSync(path) if fs.existsSync(path)
        catch e


    ###*
    create js entry file for titaniumifier
    @method createEntry
    @private
    ###
    createEntry: ->

        code = 'module.exports = {\n'
        code += "  '#{mod}': require('#{mod}'),\n" for mod in @modules
        code += '};\n'

        _____('creating entry file: %s', @tmpdir + '/' + @entryName)
        _____('its code: \n\n%s\n\n', code)
        fs.writeFileSync(@tmpdir + '/' + @entryName, code)


    ###*
    pack tmpdir into one js file using titaniumifier.packer.pack
    @method pack
    @return {Promise(Buffer)} bundled js source code
    @private
    ###
    pack: ->

        pack = require('titaniumifier').packer.pack

        cfg = {}

        _____('start titaniumifier.packer.pack()')
        packed = pack(@tmpdir, cfg)

        Promise = packed.constructor

        Promise.props(packed).then (v) -> v.source


    ###*
    locate the bundled file and create entries for modules into app/lib
    @method pack
    @param {Buffer} source
    @private
    ###
    locateBundled: (source) ->

        bundleFileName = 'tisomorphic-modules'

        _____('locating tisomorphic-modules.js into %s', @libdir)
        fs.writeFileSync(@libdir + '/' + bundleFileName + '.js', source)

        for mod in @modules

            content = "module.exports = require('#{bundleFileName}')['#{mod}'];\n"

            _____('creating module entry: %s.js into %s', mod, @libdir)
            fs.writeFileSync(@libdir + "/#{mod}.js", content)



module.exports = Tisomorphic
