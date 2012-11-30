
assert = require 'assert'
createStore = require '../lib/index'
genericTests = require 'pluggable-store-tests'
{memory, server} = require 'pluggable-store'

cache = memory()
persistence = server.fileSystem process.env.HOME+'/test-store'
store = -> createStore cache: cache, persistence: persistence
after (cb) -> persistence.removeStore cb
describe 'cache adapter', genericTests -> createStore cache: cache, persistence: persistence
describe 'lazy cache adapter', genericTests -> createStore cache: cache, persistence: persistence, lazy: true