
PluggableStore = require 'pluggable-store'
async = require 'async'

class Cache
  constructor: ({@cache, @persistence, @lazy}) ->
  createdStore: (cb) ->
    isCreated = (each, cb) -> each.createdStore cb
    async.every [@cache, @persistence], isCreated, cb
  createStore: (cb) ->
    createEach = (each, cb) ->
      each.createdStore (err, created) ->
        if created then cb null
        else each.createStore cb
    async.forEach [@cache, @persistence], createEach, cb
  removeStore: (cb) ->
    async.forEach [@cache, @persistence], ((each, cb) -> each.removeStore cb), cb
  write: (path, data, cb) ->
    if @lazy
      @cache.write path, data, cb
      @persistence.write path, data, ->
    else
      async.forEach [@cache, @persistence], ((each, cb) -> each.write path, data, cb), cb
  read: (path, cb) ->
    obj = this
    @cache.read path, (err, res) ->
      if err then obj.persistence.read path, (err, res) ->
        @cache.write path, res, ->
        cb null, res
      else cb null, res
  remove: (path, cb) ->
    if @lazy
      @cache.remove path, cb
      @persistence.remove path, ->
    else
      async.forEach [@cache, @persistence], ((each, cb) -> each.remove path, cb), cb
  keys: (cb) ->
    obj = this
    @cache.keys (err, res) ->
      if err then obj.persistence.keys cb
      else cb null, res

create = (opts) -> new PluggableStore adapter: (new Cache opts)
create.adapter = Cache
module.exports = create