var express    = require('express');
var redis      = require('redis');
var request    = require('request');
var Bitcoind   = require('./server/bitcoind');
var RedisDB    = require('./server/db/redis');
var sockjs     = require('sockjs');
var http       = require('http');
var https      = require('https');
var fs         = require('fs');
var speakeasy  = require('speakeasy');


var Server = function (config) {
  this.config = config;
  this.bitcoind = new Bitcoind(config.bitcoind);
  this.db = new RedisDB();
  this.server = express();
  this.listener = sockjs.createServer({log: function(severity, message) {}});

  // Set up routes, connect databases.
  this.db.connect();
  this.setupRoutes();
  this.exportProperties();
};

Server.prototype.start = function () {
  var that = this;

  that.listener.on('connection', function(conn) {
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

  if(that.config.httpsPort || that.config.sslKey || that.config.sslCert) {
    var httpsServer = https.createServer({
      key: fs.readFileSync(that.config.sslKey, 'utf8'),
      cert: fs.readFileSync(that.config.sslCert, 'utf8')
    }, that.server);

    that.listener.installHandlers(httpsServer, {prefix:'/listener'});
    module.exports.httpsServer = httpsServer;

    module.exports.httpServer = http.createServer(function(req, res) {
      var host = req.headers.host;
      if(typeof host == "undefined")
        return res.end();
      res.statusCode = 302;
      var host = req.headers.host;
      var hostname = host.match(/:/g) ? host.slice(0, host.indexOf(":")) : host;
      res.setHeader('Location', 'https://'+hostname+':'+that.config.httpsPort+'/');
      res.end();
    });
  } else {
    console.log('Warning: You are not running in SSL mode!');

    var httpServer = http.createServer(that.server);
    that.listener.installHandlers(httpServer, {prefix:'/listener'});
    module.exports.httpServer = httpServer;
  }
};

Server.prototype.listUnspent = function (addresses, callback) {
  this.bitcoind.rpc('listunspent', [0, 99999999999999, addresses], function(err, btcres) {
    if(err) {
      return callback(err);
    }

    var unspent = [];

    for(var i=0;i<btcres.length; i++) {
      unspent.push({
        hash:          btcres[i].txid,
        vout:          btcres[i].vout,
        address:       btcres[i].address,
        scriptPubKey:  btcres[i].scriptPubKey,
        amount:        btcres[i].amount,
        confirmations: btcres[i].confirmations
      });
    }

    callback(undefined, unspent);
  });
};

Server.prototype.saveWallet = function (req, res) {
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

Server.prototype.saveWalletAndAddresses = function(req, res) {
  var that = this;

  if(req.body.address) {
    that.bitcoind.rpc('importaddress', [req.body.address, req.body.serverKey, false], function(err, btcres) {
      if(err)
        return res.send({result: 'error', messages: [err.message]});

      that.saveWallet(req, res);
    });
  } else if(req.body.importAddresses) {
    var batch = [];

    for(var i=0;i<req.body.importAddresses.length;i++)
      batch.push({method: 'importaddress', params: [req.body.importAddresses[i], req.body.serverKey, true], id: i});

    // Doing async now because bitcoind takes a while to scan the tx for existing addresses
    that.bitcoind.batch(batch, function(err, btcres) {});

    that.saveWallet(req, res);
  } else {
    that.saveWallet(req, res);
  }
};

Server.prototype.errorResponse = function (errors) {
  if(typeof errors == 'string')
    errors = [errors];
  return {messages: errors};
};

// TODO: Break up this function.
/****************************************
 * Beginning of the horrible, horrendous,
 * terrible, tremendous routing function.
 */
Server.prototype.setupRoutes = function () {
  var that = this;

  that.server.use(express.json());
  that.server.use(express.urlencoded());
  that.server.use(express.static('public'));
  that.server.use(function(err, req, res, next){
    console.error(err.stack);
    res.send({error: true});
  });

  that.server.get('/api/generateAuthKey', function(req, res) {
    var keys = speakeasy.generate_key({length: 20});
    res.send({key: keys.base32});
  });

  that.server.post('/api/setAuthKey', function(req, res) {
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
        res.send({set: true});
      });
    });
  });

  that.server.post('/api/disableAuthKey', function(req, res) {
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
  });

  that.server.get('/api/wallet', function(req,res) {
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
  });

  that.server.post('/api/wallet/delete', function(req, res) {
    that.db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(isValid) {
      if(isValid == false)
        return res.send({result: 'error', message: 'session key was invalid'});

      that.db.delete(req.body.serverKey, function(err, deleted) {
        if(deleted == true)
          return res.send({result: 'success'});
        res.send({result: 'notfound'});
      });
    });
  });

  that.server.post('/api/change', function(req, res) {
    if(!req.body.originalServerKey)
      return res.send({result: 'error', message: 'originalServerKey required'});

    if(!req.body.serverKey)
      return res.send({result: 'error', message: 'serverKey required'});

    if(req.body.originalServerKey == req.body.serverKey)
      return res.send({result: 'ok'});

    that.db.sessionKeyValid(req.body.originalServerKey, req.body.sessionKey, sessionValidate);

    function sessionValidate(err, isValid) {
      if(err)
        return res.send({result: 'error', message: 'error validating record'});

      if(isValid == false)
        return res.send({result: 'error', message: 'session was invalid'});

      // Check for existing record
      that.db.getWalletRecord(req.body.serverKey, existingWalletRecord);
    };

    function existingWalletRecord(err, existingRecord) {
      if(err || existingRecord)
        return res.send({result: 'error', message: 'cannot change'});

      that.db.getWalletRecord(req.body.originalServerKey, walletRecord);
    };

    function walletRecord(err, record) {
      if(err)
        return res.send({result: 'error', message: 'error getting originalServerKey record, please try again later'});

      if(!record)
        return res.send({result: 'error', message: 'could not find originalServerKey record'});

      if(record.sessionKey && record.sessionKey != req.body.sessionKey)
        return res.send({result: 'error', message: 'invalid sessionKey'});

      var newRecord = {
        sessionKey: record.sessionKey,
        email: (req.body.email || record.email),
        payloadHash: req.body.payloadHash,
        wallet: req.body.wallet
      };

      if(record.authKey)
        newRecord.authKey = record.authKey;

      that.db.set(req.body.serverKey, newRecord, recordSaved);
    };

    function recordSaved(err, result) {
      if(err)
        return res.send({result: 'error', message: 'error changing record, please try again later'});

      that.db.delete(req.body.originalServerKey, oldRecordDeleted);
    };

    function oldRecordDeleted(err, isDeleted) {
      if(err)
        return res.send({result: 'error', message: 'error changing record, please try again later'});

      res.send({result: 'ok'});
    };
  });

  that.server.post('/api/wallet', function(req,res) {
    that.db.getWalletRecord(req.body.serverKey, function(err, record) {
      if(err) {
        console.log('Database error: '+err);
        return res.send(that.errorResponse('There was a server error, please try again later.'));
      }

      // New wallet
      if(!req.body.override) {
        if(record && record.wallet)
          return res.send({result: 'exists'});

        if(req.body.payload.email != undefined) {
          that.db.checkEmailExists(req.body.payload.email, function(err, response) {
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
          if(isValid == false)
            return res.send({result: 'error', messages: ['Invalid session key']});

          that.saveWalletAndAddresses(req, res);
        });
      }
    });
  });

  that.server.get('/api/weighted_prices', function(req, res) {
    /*
      For testing offline:
      res.send([{code: 'USD', rate: 40.00}]);
      return;
    */
    try {
      request({uri: that.config.pricesUrl, method: 'GET'}, function (error, pricesResponse, body) {
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

  that.server.post('/api/tx/unspent', function(req,res) {
    that.listUnspent(req.body.addresses, function(err, unspent) {
      if(err)
        return res.send({error: 'bitcoinNode'});

      res.send({unspent: unspent});
    });
  });

  that.server.post('/api/tx/details', function(req,res) {
    var i = 0;
    var queries = [];

    if(!req.body.txHashes) {
      res.send([]);
      return;
    }

    for(i=0;i<req.body.txHashes.length;i++) {
      queries.push({method: 'gettransaction', params: [req.body.txHashes[i]]});
    }

    that.bitcoind.batch(queries, function(err, results) {
      if(err) console.log(err);

      var txes = [];

      for(var i=0; i<results.length;i++) {
        var result = results[i].result;
        if(result == null)
          continue;

        txes.push({
          hash: result.txid,
          time: result.time,
          amount: result.amount,
          fee: result.fee,
          confirmations: result.confirmations,
          blockhash: result.blockhash,
          blockindex: result.blockindex,
          blocktime: result.blocktime
        });
      }

      res.send(txes);
    });
  });

  that.server.post('/api/tx/send', function(req, res) {
    that.bitcoind.rpc('sendrawtransaction', [req.body.tx], function(err, btcres) {
      if(err)
        return res.send({messages: ['Bitcoind error: '+err]});
      res.send({hash: btcres});
    });
  });
};

/* End of the horrible, horrendous,
 * terrible, tremendous routing function.
 ****************************************/

Server.prototype.exportProperties = function () {
  module.exports.config = this.config;
  module.exports.server = this.server;
}
module.exports.Server = Server;
