
assert = require 'power-assert'
path = require 'path'
fs = require 'fs'

Tisomorphic = require '../src/tisomorphic'

describe 'Tisomorphic', ->

    beforeEach ->
        cwd = path.resolve(__dirname + '/..')
        @t = new Tisomorphic(cwd)

        @testdir = path.resolve(cwd + '/test/sample-proj')

    afterEach ->
        @t.clearTmpDir()


    it 'loads package.json of the given directory', ->

        assert @t.packageJSON.name is 'tisomorphic'


    it 'rewrites "main" property of package.json to "index.js"', ->

        assert @t.packageJSON.main is 'index.js'


    it 'has modules, which are derived from package.json.dependencies', ->

        assert @t.modules.length > 0

        for moduleName in @t.modules

            assert fs.existsSync(@t.cwd + '/node_modules/' + moduleName)


    it 'generates tmp dir path, the name of which starts with ".tisomorphic-"', ->

        assert @t.tmpdir.match /\/.tisomorphic-/


    describe 'isAlloy', ->

        it 'checks if "app/lib" exists', ->

            assert @t.isAlloy() is false

            assert new Tisomorphic(@testdir).isAlloy() is true


    describe 'insertShimInfo', ->

        it 'appends shim info to packageJSON', ->

            assert not @t.packageJSON.titanium?

            @t.insertShimInfo()

            assert @t.packageJSON.titanium.superagent is 'ti-superagent'


    describe 'createTmpDir and clearTmpDir', ->

        it 'creates/removes tmp dir', ->
            assert not fs.existsSync(@t.tmpdir)

            @t.createTmpDir()
            assert fs.existsSync(@t.tmpdir)

            @t.clearTmpDir()
            assert not fs.existsSync(@t.tmpdir)


    describe 'createEntry', ->

        it 'creates an entry, which can be parsed as js file exporting modules', ->

            entryPath = @t.tmpdir + '/' + @t.entryName

            assert not fs.existsSync(entryPath)

            @t.createTmpDir()
            @t.createEntry()

            assert fs.existsSync(entryPath)

            entry = require(entryPath)

            for moduleName in @t.modules
                assert entry[moduleName]


    describe 'pack', ->

        @timeout 10000

        it 'returns Buffer of js code', ->
            @t.createTmpDir()
            @t.createEntry()

            @t.pack().then (buf) =>

                assert buf instanceof Buffer
                assert buf.length > 10000


    describe 'locateBundled', ->

        before ->
            @libdir = __dirname + '/app-lib'
            fs.mkdirSync @libdir

        after ->
            for file in fs.readdirSync @libdir
                fs.unlinkSync @libdir + '/' + file

            fs.rmdirSync @libdir


        it 'locate the bundled file and create entries for modules into libdir', ->

            @t.libdir = @libdir
            @t.locateBundled(new Buffer(100))

            assert fs.existsSync(@libdir + '/tisomorphic-modules.js')

            for moduleName in @t.modules
                assert fs.existsSync(@libdir + '/' + moduleName + '.js')

