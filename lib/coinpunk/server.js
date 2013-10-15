var express    = require('express');
var redis      = require('redis');
var request    = require('request');
var _          = require('underscore');
var config     = require('./server/config');
var Bitcoind   = require('./server/bitcoind');
var RedisDB    = require('./server/db/redis');
var server     = express();

var db = new RedisDB();
db.connect();

var bitcoind = new Bitcoind(config.bitcoind);

server.use(express.bodyParser());
server.use(express.static('public'));
server.use(function(err, req, res, next){
  console.error(err.stack);
  res.send({error: true});
});

server.get('/api/wallet', function(req,res) {
  db.getWallet(req.query.serverKey, function(err, wallet) {
    if(wallet)
      return res.send({wallet: wallet});

    if(err)
      console.log("Wallet Get Error: "+err);

    res.send({result: 'error', message: 'Wallet not found'});
  });
});

server.post('/api/wallet/delete', function(req, res) {
  db.delete(req.body.serverKey, function(err, deleted) {
    if(deleted == true)
      res.send({result: 'success'});
    else
      res.send({result: 'notfound'});
  });
});

function saveWallet(req, res) {
  db.set(req.body.serverKey, req.body.payload, function(err) {
    if(err)
      return res.send({messages: ["Database error: "+JSON.stringify(err)]});
    res.send({result: 'ok'});
  });
};

server.post('/api/wallet', function(req,res) {
  db.getWallet(req.body.serverKey, function(err, wallet) {
    if(err) {
      console.log("Wallet Get Error: "+err);
      return res.send({messages: ['Database error: '+err]});
    }

    if(wallet && !req.body.override)
      return res.send({result: 'exists', wallet: wallet});

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

      bitcoind.batch(batch, function(err, btcres) {
        if(err)
          return btcres.send({messages: [err.message]});

        saveWallet(req, res);
      });
    } else {
      saveWallet(req, res);
    }
  });
});

server.get('/api/weighted_prices', function(req, res) {
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
  bitcoind.rpc('listunspent', [0, 99999999999999, req.body.addresses], function(err, btcres) {
    if(err) {
      res.send({error: 'bitcoinNode'});
      return;
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
    var txes = _.map(results, function(result) {
      result = result.result;
      return {
        hash: result.txid,
        time: result.time,
        amount: result.amount,
        fee: result.fee,
        confirmations: result.confirmations,
        blockhash: result.blockhash,
        blockindex: result.blockindex,
        blocktime: result.blocktime
      };
    });

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

module.exports = server;
