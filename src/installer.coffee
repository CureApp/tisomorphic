

fs = require 'fs'
PackageJSONLoader = require './package-json-loader'
WorkingDirectory = require './working-directory'

###*
attach npm scripts to package.json

@class Installer
###
class Installer

    ###*
    add scripts and custom fields to package.json

    @method run
    @static
    ###
    @run: ->
        cwd = new WorkingDirectory().resolve()
        new @(cwd).install()


    ###*
    @constructor
    @param {String} cwd current working directory
    ###
    constructor: (@cwd) ->

        @packageJSON = PackageJSONLoader.load(@cwd)


    ###*
    attach scripts and custom fields to package.json
    @method install
    @public
    ###
    install: ->
        @attachScripts()
        PackageJSONLoader.save(@cwd, @packageJSON)



    ###*
    attach scripts
    @method attachScripts
    @private
    ###
    attachScripts: ->

        newScripts =
            'tisomorphic': 'tisomorphic'

        existingScripts = @packageJSON.scripts ? {}

        @setNonExistingValues(existingScripts, newScripts)

        @packageJSON.scripts = existingScripts



    ###*
    attach values to object
    @method setNonExistingValues
    @private
    ###
    setNonExistingValues: (original = {}, newObj = {}) ->

        for key, value of newObj when not original[key]?
            console.log "appending #{key}: '#{value}' to package.json"
            original[key] = value



module.exports = Installer
