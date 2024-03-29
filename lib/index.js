// Generated by CoffeeScript 1.4.0
(function() {
  var Cache, PluggableStore, async, create;

  PluggableStore = require('pluggable-store');

  async = require('async');

  Cache = (function() {

    function Cache(_arg) {
      this.cache = _arg.cache, this.persistence = _arg.persistence, this.lazy = _arg.lazy;
    }

    Cache.prototype.exists = function(cb) {
      var eachExists;
      eachExists = function(each, cb) {
        return each.exists(cb);
      };
      return async.every([this.cache, this.persistence], eachExists, cb);
    };

    Cache.prototype.create = function(cb) {
      var createEach;
      createEach = function(each, cb) {
        return each.exists(function(err, exists) {
          if (exists) {
            return cb(null);
          } else {
            return each.create(cb);
          }
        });
      };
      return async.forEach([this.cache, this.persistence], createEach, cb);
    };

    Cache.prototype.destroy = function(cb) {
      return async.forEach([this.cache, this.persistence], (function(each, cb) {
        return each.destroy(cb);
      }), cb);
    };

    Cache.prototype.write = function(path, data, cb) {
      if (this.lazy) {
        this.cache.write(path, data, cb);
        return this.persistence.write(path, data, function() {});
      } else {
        return async.forEach([this.cache, this.persistence], (function(each, cb) {
          return each.write(path, data, cb);
        }), cb);
      }
    };

    Cache.prototype.read = function(path, cb) {
      var obj;
      obj = this;
      return this.cache.read(path, function(err, res) {
        if (res) {
          return cb(null, res);
        } else {
          return obj.persistence.read(path, function(err, res) {
            obj.cache.write(path, res, function() {});
            return cb(null, res);
          });
        }
      });
    };

    Cache.prototype.remove = function(path, cb) {
      if (this.lazy) {
        this.cache.remove(path, cb);
        return this.persistence.remove(path, function() {});
      } else {
        return async.forEach([this.cache, this.persistence], (function(each, cb) {
          return each.remove(path, cb);
        }), cb);
      }
    };

    Cache.prototype.keys = function(cb) {
      return this.persistence.keys(cb);
    };

    return Cache;

  })();

  create = function(opts) {
    return new PluggableStore({
      adapter: new Cache(opts)
    });
  };

  create.adapter = Cache;

  module.exports = create;

}).call(this);
