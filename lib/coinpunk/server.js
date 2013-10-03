var express    = require('express');
var redis      = require('redis');
var request    = require('request');
var bigdecimal = require('bigdecimal');
var _          = require('underscore');
var config     = require('./server/config');
var Bitcoind   = require('./server/bitcoind');
var db         = require('./server/db');
var server     = express();

var bitcoind = new Bitcoind(config.bitcoind);

server.use(express.bodyParser());
server.use(express.static('public'));
server.use(function(err, req, res, next){
  console.error(err.stack);
  res.send({error: true});
});

server.get('/api/wallet', function(req,res) {
  db.get(req.query.serverKey, function(err, wallet) {
    if(err) console.log("Wallet Get Error: "+err);

    if(wallet)
      return res.send({wallet: wallet});
    
    res.send({result: 'error', message: 'Wallet not found'});
  });
});

server.post('/api/wallet', function(req,res) {
  db.get(req.body.serverKey, function(err, wallet) {
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

        db.set(req.body.serverKey, req.body.wallet, function(err) {
          if(err)
            return res.send({messages: ["Database error: "+JSON.stringify(err)]});
          res.send({result: 'ok'});
        });
      });
    } else {
      db.set(req.body.serverKey, req.body.wallet, function(err) {
        if(err)
          return res.send({messages: ["Database error: "+JSON.stringify(err)]});
        res.send({result: 'ok'});
      });
    }
  });
});

server.saveWallet = function(serverKey, wallet) {
  db.set(serverKey, wallet, function(err) {
    if(err)
      return res.send({messages: ["Database error: "+JSON.stringify(err)]});
    res.send({result: 'ok'});
  });
}

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

server.get('/api/tx/unspent', function(req,res) {
  bitcoind.rpc('listunspent', [0, 9999999, req.query.addresses], function(err, btcres) {
    
    if(err) {
      res.send({error: 'bitcoinNode'});
      return;
    }
    
    var amount = 0;
    var unspent = [];

    for(var i=0;i<btcres.length; i++) {
      unspent.push({
        hash:                btcres[i].txid,
        vout:                btcres[i].vout,
        address:             btcres[i].address,
        scriptPubKey:        btcres[i].scriptPubKey,
        amount:              btcres[i].amount,
        amountSatoshiString: bigdecimal.BigDecimal(btcres[i].amount.toString()).scaleByPowerOfTen(8).toBigInteger().toString()
      });

      amount += btcres[i].amount;
    }

    res.send({unspent: unspent, amount: amount});
  });
});

server.get('/api/tx/details', function(req,res) {
  var i = 0;
  var queries = [];

  if(!req.query.txHashes) {
    res.send([]);
    return;
  }

  for(i=0;i<req.query.txHashes.length;i++) {
    queries.push({method: 'gettransaction', params: [req.query.txHashes[i]]});
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