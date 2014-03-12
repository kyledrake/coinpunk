var controller = require('./controller.js');
var speakeasy  = require('speakeasy');

var WalletController = function (root, express, db, websocket, insight) {
  var that = this;
  controller.Controller.call(this, root, express, db, insight);

  // Set up a websocket for streaming transactions.
  websocket.on('connection', function(conn) {
    conn.on('data', function(message) {
      var req = JSON.parse(message);

      if(req.method == 'listUnspent')
        that.listUnspent(req.addresses, function(err, unspent) {
          if(err)
            conn.write(JSON.stringify(err));
          else
            conn.write(JSON.stringify({method: 'listUnspent', result: unspent}));
        });
    });
  });

  // Singleton REST endpoint.
  express.get(root, that._read.bind(that))

  // Call our parent constructor.
  controller.Controller.call(that, root, express, db, insight);
};

// Inherit from Controller.
WalletController.prototype = new controller.Controller();
WalletController.prototype.constructor = WalletController;

// Store for incoming wallet creates to throttle DDoS attacks involving new wallet creation.
var addressCheck = [];

/**
 * Create a new wallet for the user. 
 */
WalletController.prototype._create = function(req,res) {
  var that = this;

  that.db.getWalletRecord(req.body.serverKey, function(err, record) {
    if(err) {
      console.log('Database error: '+err);
      return res.send(that.errorResponse('There was a server error, please try again later.'));
    }

    // New wallet
    if(!req.body.override) {
      if(record && record.wallet)
        return res.send({result: 'exists'});

      var originAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

      var forwardedIps = originAddress.split(',');
      originAddress = forwardedIps[0];

      // if < 2 minutes since create, throw error.
      if(addressCheck[originAddress] && addressCheck[originAddress].timeStamp > Date.now()-120000) {
        return res.send({result: 'error', messages: ['Too many wallets created from your address, please try again later']});
      }

      addressCheck[originAddress] = {timeStamp: Date.now()};

      if(req.body.payload.email != undefined) {
        return that.db.checkEmailExists(req.body.payload.email, function(err, response) {
          if(response == true)
            return res.send({result: 'error', messages: ['Email address already exists']});
          that.saveWalletAndAddresses(req, res);
        });
      }

      that.saveWalletAndAddresses(req, res);
    } else {
      // Not new, check the session key
      that.db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(err, isValid) {
        if(err)
          return res.send({result: 'error', messages: ['Database error, please try again later']});
        if(isValid == false) {
          return res.send({result: 'error', messages: ['Invalid session key']});
        }

        that.saveWalletAndAddresses(req, res);
      });
    }
  });
};

/**
 * Update the current user's wallet.
 */
WalletController.prototype._update = function (req, res) {
  var that = this;

  that.db.getWalletRecord(req.body.serverKey, function(err, record) {
    if(err) {
      console.log('Database error: '+err);
      return res.send(that.errorResponse('There was a server error, please try again later.'));
    }

    that.db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(err, isValid) {
      if(err)
        return res.send({result: 'error', messages: ['Database error, please try again later']});
      if(isValid == false)
        return res.send({result: 'error', messages: ['Invalid session key']});

      that.saveWalletAndAddresses(req, res);
    });
  });
};

/**
 * Retrieve the user's wallet, if they are logged in.
 */
WalletController.prototype._read = function(req,res) {
  var that = this;

  that.db.getWalletRecord(req.query.serverKey, function(err, payload) {
    if(err) {
      console.log('Wallet Get Error: '+err);
      return res.send({result: 'error', message: 'Error retreiving wallet'});
    }

    if(!payload || !payload.wallet)
      return res.send({result: 'error', message: 'Invalid login information'});

    if(typeof req.query.authCode == 'undefined' && payload.authKey)
      return res.send({result: 'authCodeNeeded', message: 'Two factor authentication code needed'});

    if(payload.authKey) {
      var code = speakeasy.time({key: payload.authKey, encoding: 'base32'});
      if(req.query.authCode != code)
        return res.send({result: 'error', message: 'Two factor authentication code was invalid'});
    }

    that.db.generateSessionKey(req.query.serverKey, function(err, key) {
      if(err)
        return res.send({result: 'error', message: 'Error generating session key, please try again later'});

      res.send({wallet: payload.wallet, sessionKey: key});
    });
  });
};

/**
 * Delete the user's wallet, if they are logged in.
 */
WalletController.prototype._delete = function(req, res) {
  var that = this;

  that.db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(isValid) {
    if(isValid == false)
      return res.send({result: 'error', message: 'session key was invalid'});

    that.db.delete(req.body.serverKey, function(err, deleted) {
      if(deleted == true)
        return res.send({result: 'success'});
      res.send({result: 'notfound'});
    });
  });
};

/**
 * Saves the current user's wallet and addresses.
 */
WalletController.prototype.saveWalletAndAddresses = function(req, res) {
  var that = this;

  if(req.body.address)
    return that.saveWallet(req, res);

  if(req.body.importAddresses) {
    var batch = [];
    return that.saveWallet(req, res);
  }
  
  that.saveWallet(req, res);
};

WalletController.prototype.saveWallet = function (req, res) {
  var that = this;

  if(req.body.sessionKey)
    req.body.payload.sessionKey = req.body.sessionKey;

  that.db.set(req.body.serverKey, req.body.payload, function(err, data) {
    if(err) {
      if(err == 'outOfSync') {
        return res.send({result: 'outOfSync', wallet: data.wallet});
      } else {
        return res.send({result: 'error', messages: JSON.stringify(err)});
      }
    } else {
      if(!req.body.override) {
        that.db.generateSessionKey(req.body.serverKey, function(err, key) {
          res.send({result: 'ok', sessionKey: key});
        });
        return;
      } else {
        res.send({result: 'ok'});
      }
    }
  });
};

// Exports
module.exports.WalletController = WalletController;
