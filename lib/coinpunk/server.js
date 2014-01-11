var express    = require('express');
var redis      = require('redis');
var request    = require('request');
var config     = require('./server/config');
var Bitcoind   = require('./server/bitcoind');
var RedisDB    = require('./server/db/redis');
var sockjs     = require('sockjs');
var http       = require('http');
var https      = require('https');
var fs         = require('fs');
var speakeasy  = require('speakeasy');

var server     = express();

var db = new RedisDB();
db.connect();

var bitcoind = new Bitcoind(config.bitcoind);

var listener = sockjs.createServer({log: function(severity, message) {}});

function listUnspent(addresses, callback) {
  bitcoind.rpc('listunspent', [0, 99999999999999, addresses], function(err, btcres) {
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

listener.on('connection', function(conn) {
    conn.on('data', function(message) {
      var req = JSON.parse(message);

      if(req.method == 'listUnspent')
        listUnspent(req.addresses, function(err, unspent) {
          if(err)
            conn.write(JSON.stringify(err));
          else
            conn.write(JSON.stringify({method: 'listUnspent', result: unspent}));
        });
    });
});

server.use(express.json());
server.use(express.urlencoded());
server.use(express.static('public'));
server.use(function(err, req, res, next){
  console.error(err.stack);
  res.send({error: true});
});

server.get('/api/generateAuthKey', function(req, res) {
  var keys = speakeasy.generate_key({length: 20});
  res.send({key: keys.base32});
});

server.post('/api/setAuthKey', function(req, res) {
  var code = speakeasy.time({key: req.body.key, encoding: 'base32'});

  if(code != req.body.code) {
    return res.send({set: false});
  }

  db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(err, success) {
    if(err || success == false) {
      return res.send({set: false});
    }

    db.setAuthKey(req.body.serverKey, req.body.key, function(err, success) {
      if(err) {
        return res.send({set: false});
      }
      res.send({set: true});
    });
  });
});

server.post('/api/disableAuthKey', function(req, res) {
  db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(err, success) {
    if(err || success == false)
      return res.send({result: 'error', message: 'session key was invalid'});

    db.getWalletRecord(req.body.serverKey, function(err, payload) {
      if(err)
        console.log('Wallet Get Error: '+err);

      if(!payload || !payload.authKey)
        return res.send({result: 'error', message: 'no auth key found for this wallet'});

      var code = speakeasy.time({key: payload.authKey, encoding: 'base32'});

      if(code != req.body.authCode)
        return res.send({result: 'error', message: 'invalid auth code'});

      db.disableAuthKey(req.body.serverKey, function(err, result) {
        if(err)
          return res.send({result: 'error', message: 'could not update database, please try again later'});
        res.send({result: 'success'});
      });
    });
  });
});

server.get('/api/wallet', function(req,res) {
  db.getWalletRecord(req.query.serverKey, function(err, payload) {
    if(err) {
      console.log('Wallet Get Error: '+err);
      return res.send({result: 'error', message: 'Error retreiving wallet'});
    }

    if(!payload || !payload.wallet)
      return res.send({result: 'error', message: 'Wallet not found'});

    if(typeof req.query.authCode == 'undefined' && payload.authKey)
      return res.send({result: 'authCodeNeeded', message: 'Two factor authentication code needed'});

    if(payload.authKey) {
      var code = speakeasy.time({key: payload.authKey, encoding: 'base32'});
      if(req.query.authCode != code)
        return res.send({result: 'error', message: 'Two factor authentication code was invalid'});
    }

    db.generateSessionKey(req.query.serverKey, function(err, key) {
      if(err)
        return res.send({result: 'error', message: 'Error generating session key, please try again later'});
      res.send({wallet: payload.wallet, sessionKey: key});
    });
  });
});

server.post('/api/wallet/delete', function(req, res) {
  db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(isValid) {
    if(isValid == false)
      return res.send({result: 'error', message: 'session key was invalid'});

    db.delete(req.body.serverKey, function(err, deleted) {
      if(deleted == true)
        return res.send({result: 'success'});
      res.send({result: 'notfound'});
    });
  });
});

function saveWallet(req, res) {
  if(req.body.sessionKey)
    req.body.payload.sessionKey = req.body.sessionKey;

  db.set(req.body.serverKey, req.body.payload, function(err, data) {
    if(err) {
      if(err == 'outOfSync') {
        return res.send({result: 'outOfSync', wallet: data.wallet});
      } else {
        return res.send({result: 'error', messages: JSON.stringify(err)});
      }
    } else {
      if(!req.body.override) {
        db.generateSessionKey(req.body.serverKey, function(err, key) {
          res.send({result: 'ok', sessionKey: key});
        });
        return;
      } else {
        res.send({result: 'ok'});
      }
    }
  });
};

function saveWalletAndAddresses(req, res) {
  if(req.body.address) {
    bitcoind.rpc('importaddress', [req.body.address, req.body.serverKey, false], function(err, btcres) {
      if(err)
        return res.send({messages: [err.message]});

      saveWallet(req, res);
    });
  } else if(req.body.importAddresses) {
    var batch = [];

    for(var i=0;i<req.body.importAddresses.length;i++)
      batch.push({method: 'importaddress', params: [req.body.importAddresses[i], req.body.serverKey, true], id: i});

    // Doing async now because bitcoind takes a while to scan the tx for existing addresses
    bitcoind.batch(batch, function(err, btcres) {});

    saveWallet(req, res);
  } else {
    saveWallet(req, res);
  }
};

function registerAddresses(addresses, callback) {
  var isNew = false;

  if(typeof addresses == 'string') {
    isNew = true;
    var addresses = [addresses];
  }

  bitcoind.rpc('importaddress', [addresses, null, isNew], function(err, btcres) {
    if(err)
      return callback(err.message);

    callback(null, true)
  });
}

function errorResponse(errors) {
  if(typeof errors == 'string')
    errors = [errors];
  return {messages: errors};
}

server.post('/api/change', function(req, res) {
  if(!req.body.originalServerKey)
    return res.send({result: 'error', message: 'originalServerKey required'});

  if(!req.body.serverKey)
    return res.send({result: 'error', message: 'serverKey required'});

  if(req.body.originalServerKey == req.body.serverKey)
    return res.send({result: 'ok'});

  db.sessionKeyValid(req.body.originalServerKey, req.body.sessionKey, sessionValidate);

  function sessionValidate(err, isValid) {
    if(err)
      return res.send({result: 'error', message: 'error validating record'});

    if(isValid == false)
      return res.send({result: 'error', message: 'session was invalid'});

    // Check for existing record
    db.getWalletRecord(req.body.serverKey, existingWalletRecord);
  };

  function existingWalletRecord(err, existingRecord) {
    if(err || existingRecord)
      return res.send({result: 'error', message: 'cannot change'});

    db.getWalletRecord(req.body.originalServerKey, walletRecord);
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

    db.set(req.body.serverKey, newRecord, recordSaved);
  };

  function recordSaved(err, result) {
    if(err)
      return res.send({result: 'error', message: 'error changing record, please try again later'});

    db.delete(req.body.originalServerKey, oldRecordDeleted);
  };

  function oldRecordDeleted(err, isDeleted) {
    if(err)
      return res.send({result: 'error', message: 'error changing record, please try again later'});

    res.send({result: 'ok'});
  };
});

server.post('/api/wallet', function(req,res) {
  db.getWalletRecord(req.body.serverKey, function(err, record) {
    if(err) {
      console.log('Database error: '+err);
      return res.send(errorResponse('There was a server error, please try again later.'));
    }

    // New wallet
    if(!req.body.override) {
      if(record && record.wallet)
        return res.send({result: 'exists'});

      if(req.body.payload.email != undefined) {
        db.checkEmailExists(req.body.payload.email, function(err, response) {
          if(response == true)
            return res.send({result: 'error', messages: ['Email address already exists']});
          saveWalletAndAddresses(req, res);
        });
      }

      saveWalletAndAddresses(req, res);
    } else {
      // Not new, check the session key
      db.sessionKeyValid(req.body.serverKey, req.body.sessionKey, function(err, isValid) {
        if(err)
          return res.send({result: 'error', messages: ['Database error, please try again later']});
        if(isValid == false)
          return res.send({result: 'error', messages: ['Invalid session key']});

        saveWalletAndAddresses(req, res);
      });
    }
  });
});

server.get('/api/weighted_prices', function(req, res) {
  /*
    For testing offline:
    res.send([{code: 'USD', rate: 40.00}]);
    return;
  */
  try {
    request({uri: config.pricesUrl, method: 'GET'}, function (error, pricesResponse, body) {
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

server.post('/api/tx/unspent', function(req,res) {
  listUnspent(req.body.addresses, function(err, unspent) {
    if(err)
      return res.send({error: 'bitcoinNode'});

    res.send({unspent: unspent});
  });
});

server.post('/api/tx/details', function(req,res) {
  var i = 0;
  var queries = [];

  if(!req.body.txHashes) {
    res.send([]);
    return;
  }

  for(i=0;i<req.body.txHashes.length;i++) {
    queries.push({method: 'gettransaction', params: [req.body.txHashes[i]]});
  }

  bitcoind.batch(queries, function(err, results) {
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

server.post('/api/tx/send', function(req, res) {
  bitcoind.rpc('sendrawtransaction', [req.body.tx], function(err, btcres) {
    if(err)
      return res.send({messages: ['Bitcoind error: '+err]});
    res.send({hash: btcres});
  });
});

if(config.httpsPort || config.sslKey || config.sslCert) {
  var httpsServer = https.createServer({
    key: fs.readFileSync(config.sslKey, 'utf8'),
    cert: fs.readFileSync(config.sslCert, 'utf8')
  }, server);

  listener.installHandlers(httpsServer, {prefix:'/listener'});
  module.exports.httpsServer = httpsServer;

  module.exports.httpServer = http.createServer(function(req, res) {
    var host = req.headers.host;
    if(typeof host == "undefined")
      return res.end();
    res.statusCode = 302;
    var host = req.headers.host;
    var hostname = host.match(/:/g) ? host.slice(0, host.indexOf(":")) : host;
    res.setHeader('Location', 'https://'+hostname+':'+config.httpsPort+'/');
    res.end();
  });
} else {
  console.log('Warning: You are not running in SSL mode!');

  var httpServer = http.createServer(server);
  listener.installHandlers(httpServer, {prefix:'/listener'});
  module.exports.httpServer = httpServer;
}

module.exports.config = config;
module.exports.server = server;
