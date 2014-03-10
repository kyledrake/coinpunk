var DB = require('../db');
var crypto = require('crypto');

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var walletSchema = new Schema({
  serverKey: { type: String, index: { unique: true } },
  email: String,
  wallet: String,
  payloadHash: String,
  newPayloadHash: String,
  originalPayloadHash: String,
  authKey: String,
  sessionKey: String
});

var Wallet = mongoose.model('Wallet', walletSchema);

function ArgumentError(message) {
  this.name = 'ArgumentError';
  this.message = message || 'missing arguments';
}

ArgumentError.prototype = new Error();
ArgumentError.prototype.constructor = ArgumentError;

DB.prototype = {
  connect: function(config) {
    // If mongod is running
    mongoose.connection.on('open', function() {
      console.log('Connected to mongo server.');
    });

    // If mongod is not running
    mongoose.connection.on('error', function(err) {
      console.log('Could not connect to mongo server!');
      console.log(err);
    });

    this.mongo = mongoose.connect(config);
  },

  getWalletRecord: function(serverKey, callback) {
    Wallet.findOne({'serverKey': serverKey}, function (err, res) {
      if (err)
        return callback(err);
      callback(undefined, res);
    });
  },

  sessionKeyValid: function(serverKey, sessionKey, callback) {
    this.getSessionKey(serverKey, function(err, dbKey) {
      if(dbKey && sessionKey == dbKey)
        return callback(undefined, true);
      callback(undefined, false);
    });
  },

  getSessionKey: function(serverKey, callback) {
    this.getWalletRecord(serverKey, function(err, res) {
      if (err)
        return callback(err);
      callback(undefined, res.sessionKey);
    });
  },

  generateSessionKey: function(serverKey, callback) {
    var self = this;
    crypto.randomBytes(24, function(ex, buf) {
      var token = buf.toString('hex');

      Wallet.update({'serverKey': serverKey}, {$set: {'sessionKey': token}}, undefined, function(err) {
        if(err)
          return callback(err);
        callback(undefined, token);
      });
    });
  },

  setAuthKey: function(serverKey, authKey, callback) {
    Wallet.update({'serverKey': serverKey}, {$set: {'authKey': authKey}}, undefined, function(err, res) {
      if(err)
        return callback(err);
      callback(undefined, true);
    });
  
  },

  disableAuthKey: function(serverKey, callback) {
    Wallet.update({'serverKey': serverKey}, {$set: {'authKey': ''}}, undefined, function(err, res) {
      if(err)
        return callback(err);
      callback(undefined, true);
    });
  },

  getWallet: function(serverKey, callback) {
    this.getWalletRecord(serverKey, function(err, payload) {
      if(err)
        return callback(err);
      if(!payload)
        return callback(undefined, null);

      callback(undefined, payload.wallet);
    });
  },

  set: function(serverKey, payload, callback) {
    var self = this;

    if(!payload || (payload && !payload.wallet))
      callback('missing wallet payload');

    self.getWalletRecord(serverKey, function (err, res) {
      if(err)
        callback('database error: '+err);
      if(res && res.payloadHash != undefined && res.payloadHash != 'undefined' && payload.originalPayloadHash != undefined && payload.originalPayloadHash != res.payloadHash) {
        return callback('outOfSync', {wallet: res.wallet});
      } else {
        if(payload.newPayloadHash)
          payload.payloadHash = payload.newPayloadHash;

        delete payload.originalPayloadHash;
        delete payload.newPayloadHash;

        Wallet.update({serverKey: serverKey}, payload, { upsert: true }, function(err) {
          if (err) {
            callback('database error: '+err);
          }
          else {
            self.getWallet(serverKey, function (err, wallet) {
              if (err) {
                callback('database error: '+err);
              }
              return callback(undefined, {wallet: wallet});
            });
          }
        });
      }
    });
  },

  delete: function(serverKey, callback) {
    Wallet.remove({serverKey: serverKey}, function(err, res) {
      if (err) {
        callback(err, false);
      }
      else {
        callback(undefined, true);
      }
    });
  },

  checkEmailExists: function(email, callback) {
    var email = email.toString().toLowerCase();
    var self = this;
    
    Wallet.findOne({email: email}, 'email', function (err, res) {
      if (err)
        callback('database error: '+err);
      if(res && res.email.toString().toLowerCase() == email)
        return callback(undefined, true)
      callback(undefined, false)
    });
  }
};

module.exports = DB;
