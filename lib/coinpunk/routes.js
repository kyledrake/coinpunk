var request    = require('request');
var sockjs     = require('sockjs');
var http       = require('http');
var https      = require('https');
var fs         = require('fs');
var speakeasy  = require('speakeasy');
var server     = require('./server.js');
var authkey    = require('./controllers/authkey.js');
var wallet     = require('./controllers/wallet.js');
var tx         = require('./controllers/tx.js');
var user       = require('./controllers/user.js');

module.exports.create = function (express, db, websocket, insight) {
  // Create our controllers. 
  // The third parameter passed is the new REST API root.
  var authKeyController = new authkey.AuthKeyController(
    '/api/dev/authkey', express, db
  );

  var walletController = new wallet.WalletController(
    '/api/dev/wallet', express, db, websocket, insight
  );

  var txController = new tx.TxController(
    '/api/dev/tx', express, db, insight
  );

  var userController = new user.UserController(
    '/api/dev/user', express, db
  );

  // Old API routes.

  // Auth key:
  express.get('/api/generateAuthKey', authKeyController._create.bind(authKeyController));
  express.post('/api/setAuthKey', authKeyController._update.bind(authKeyController));
  express.post('/api/disableAuthKey', authKeyController._delete.bind(authKeyController));

  // Wallet:
  express.get('/api/wallet', walletController._read.bind(walletController));
  express.post('/api/wallet/delete', walletController._delete.bind(walletController));
  express.post('/api/wallet', walletController._create.bind(walletController));

  // Transactions:
  express.post('/api/tx/unspent', txController._search_unspent.bind(txController));
  express.post('/api/tx/details', txController._search_hashes.bind(txController));
  express.post('/api/tx/send', txController._create.bind(txController));

  // Users:
  express.post('/api/change', userController._update.bind(userController));

  // Leaving this one as a one-off, since it doesn't make sense to me right now
  // to turn it into a Controller.
  express.get('/api/weighted_prices', function(req, res) {
    /*
      For testing offline:
      res.send([{code: 'USD', rate: 40.00}]);
      return;
    */
    try {
      request({uri: server.config.pricesUrl, method: 'GET'}, function (error, pricesResponse, body) {
        if (!error && pricesResponse.statusCode == 200) {
          res.send(JSON.parse(body));
        } else {
          res.send({error: 'cannot connect to the weighted prices API'});
        }
        return;
      });
    } catch(err)  {
      console.log(err);
      res.send({error: 'cannot connect to the weighted prices API'});
    }
  });
};

