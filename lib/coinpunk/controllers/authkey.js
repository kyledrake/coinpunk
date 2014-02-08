var controller = require('./controller.js');
var speakeasy  = require('speakeasy');

var AuthKeyController = function (root, express, db) {
  this.db = db;

  // Set up RESTful routes.
  express.post(root, this._create.bind(this));
  express.put(root, this._update.bind(this));
  express.delete(root, this._delete.bind(this));
};

// Inherit from Controller.
AuthKeyController.prototype = new controller.Controller();
AuthKeyController.prototype.constructor = AuthKeyController;

/**
 * Generates a new session key.
 */
AuthKeyController.prototype._create = function(req, res) {
  var keys = speakeasy.generate_key({length: 20});
  res.send({key: keys.base32});
};

/**
 * Allows the user to replace their session key with a new value.
 */
AuthKeyController.prototype._update = function(req, res) {
  var that = this;
  var code = speakeasy.time({key: req.body.key, encoding: 'base32'});

  if(code != req.body.code) {
    return res.send({set: false});
  }

  that.db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(err, success) {
    if(err || success == false) {
      return res.send({set: false});
    }

    that.db.setAuthKey(req.body.serverKey, req.body.key, function(err, success) {
      if(err) {
        return res.send({set: false});
      }
      // TODO: Shouldn't we be invalidating the old session key here?
      res.send({set: true});
    });
  });
};

/**
 * Invalidate the user's current session key.
 */ 
AuthKeyController.prototype._delete = function(req, res) {
  var that = this;
  that.db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(err, success) {
    if(err || success == false)
      return res.send({result: 'error', message: 'session key was invalid'});

    that.db.getWalletRecord(req.body.serverKey, function(err, payload) {
      if(err)
        console.log('Wallet Get Error: '+err);

      if(!payload || !payload.authKey)
        return res.send({result: 'error', message: 'no auth key found for this wallet'});

      var code = speakeasy.time({key: payload.authKey, encoding: 'base32'});

      if(code != req.body.authCode)
        return res.send({result: 'error', message: 'invalid auth code'});

      that.db.disableAuthKey(req.body.serverKey, function(err, result) {
        if(err)
          return res.send({result: 'error', message: 'could not update database, please try again later'});
        res.send({result: 'success'});
      });
    });
  });
};

// Exports
module.exports.AuthKeyController = AuthKeyController;
