var DB = require('../db');

if(process.env.NODE_ENV == 'test')
  var redis = require('redis-mock');
else
  var redis = require('redis');

function ArgumentError(message) {
  this.name = 'ArgumentError';
  this.message = message || 'missing arguments';
}

ArgumentError.prototype = new Error();
ArgumentError.prototype.constructor = ArgumentError;

DB.prototype = {
  connect: function() {
    this.redis = redis.createClient(null, null);
  },

  getWallet: function(serverKey, callback) {
    this.redis.hgetall(serverKey, function(err, payload) {
      if(payload && payload.wallet)
        callback(undefined, payload.wallet)
      else
        callback(err);
    });
  },

  set: function(serverKey, payload, callback) {
    if(!payload || (payload && !payload.wallet))
      callback('missing wallet payload');

    this.redis.hmset(serverKey, payload, callback);
  },

  delete: function(serverKey, callback) {
    this.redis.del(serverKey, function(err, res) {
      if(err)
        callback(err);
        
      if(res == 1)
        callback(undefined, true);
      else
        callback(undefined, false);
    });
  }
};

module.exports = DB;