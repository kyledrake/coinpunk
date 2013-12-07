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
  },
  
  checkEmailExists: function(email, callback) {
    var self = this;
    this.redis.keys('*', function(err, serverKeys) {
      if(err)
        return callback(err);
      
      for(var k=0;k<serverKeys.length;k++)
        self.redis.hmget(serverKeys[k], 'email', function(err, res) {
          if(err)
            return callback(err);
          if(res == email)
            return callback(undefined, true)
        });

      callback(undefined, false)
    });
  }
};

module.exports = DB;