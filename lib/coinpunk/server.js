var express    = require('express');
var redis      = require('redis');
var http       = require('http');
var bigdecimal = require('bigdecimal');
var config     = require('./server/config');
var Bitcoind   = require('./server/bitcoind');
var db         = require('./server/db');
var server     = express();

var bitcoind = new Bitcoind(config.bitcoind);

server.use(express.bodyParser());
server.use(express.static('public'));
server.use(function(err, req, res, next){
  console.error(err.stack);
  res.send(500, 'Something broke!');
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
    
    if(wallet)
      return res.send({result: 'exists', wallet: wallet});

    db.set(req.body.serverKey, req.body.wallet, function(err) {
      if(err)
        return res.send({messages: ["Database error: "+err]});

      bitcoind.rpc('importaddress', [req.body.address, req.body.serverKey, "false"], function(err, btcres) {
        if(err)
          return res.send({messages: ['Bitcoind error: '+err]});
        res.send({result: 'ok'});
      });
    });
  });
});

server.get('/api/dashboard', function(req,res) {
  bitcoind.batch([
    {method: 'getaddressesbyaccount', params: [req.query.serverKey]},
    {method: 'listtransactions', params: [req.query.serverKey]},
    {method: 'getbalance', params: [req.query.serverKey]}
  ], function(err, results) {
    if(err) console.log(err);

    if(!results) {
      console.log('Bitcoind returned no results');
      return res.json({messages: ['Bitcoind error: server returned no information or is down']})
    }

    res.json({
      addresses: results[0].result,
      transactions: results[1].result,
      balance: results[2].result
    });
  });
});

/* This is a workaround until one of the APIs provide Access-Control-Allow-Origin * or JSONP support. */
server.get('/api/weighted_prices', function(req, res) {
  http.get('http://api.bitcoincharts.com/v1/weighted_prices.json', function(resp) {
    var str = '';
    resp.on('data', function(chunk) {
      str += chunk;
    });

    resp.on('end', function() {
      res.send(str);
    });
  });
});

server.get('/api/tx/unspent', function(req,res) {
  bitcoin.listUnspent(1, 9999999, req.query.addresses, function(err, btcres) {

    /* WHY GOD WHY */
    for(var i=0;i<btcres.result.length; i++) {
      btcres.result[i].amountSatoshiString = bigdecimal.BigDecimal(btcres.result[i].amount.toString()).scaleByPowerOfTen(8).toBigInteger().toString();
    }

    res.send({unspentTxs: btcres.result});
  });
});

server.get('/api/tx/details', function(req,res) {
  bitcoin.getTransaction(req.query.txid, function(err, btcres) {
    if(err)
      return res.send({messages: ['Bitcoind error: '+err]});
    res.send({tx: btcres.result});
  });
});

module.exports = server;