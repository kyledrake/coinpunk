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

    bitcoind.rpc('importaddress', [req.body.address, req.body.serverKey, false], function(err, btcres) {
      if(err)
        return res.send({messages: [err.message]});

      db.set(req.body.serverKey, req.body.wallet, function(err) {
        if(err)
          return res.send({messages: ["Database error: "+JSON.stringify(err)]});
        res.send({result: 'ok'});
      });
    });
  });
});

server.get('/api/dashboard', function(req,res) {
  var i = 0;
  var addresses = req.query.addresses;
  
  bitcoind.batch([
    {method: 'getaddressesbyaccount', params: [req.query.serverKey]},
    {method: 'listtransactions', params: []},
    {method: 'listunspent', params: [1, 9999999, addresses]},
  ], function(err, results) {
    if(err) console.log(err);

    if(!results) {
      console.log('Bitcoind returned no results');
      return res.json({messages: ['Bitcoind error: server returned no information or is down']})
    }
    
    var transactions = [];
    
    for(i=0;i<results[1].result.length;i++) {
      for(var v=0;v<addresses.length;v++) {
        if(results[1].result[i].address == addresses[v])
          transactions.push(results[1].result[i]);
      }
    }
    
    var balance = 0;
    for(i=0; i<results[2].result.length; i++) {
      balance = balance + results[2].result[i].amount;
    }

    res.json({
      addresses: results[0].result,
      transactions: transactions,
      balance: balance
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
  bitcoind.rpc('listunspent', [1, 9999999, req.query.addresses], function(err, btcres) {
    var amount = 0;

    for(var i=0;i<btcres.length; i++) {
      btcres[i].amountSatoshiString = bigdecimal.BigDecimal(btcres[i].amount.toString()).scaleByPowerOfTen(8).toBigInteger().toString();
      amount += btcres[i].amount;
    }

    res.send({unspentTxs: btcres, amount: amount});
  });
});

server.get('/api/tx/details', function(req,res) {
  bitcoind.rpc('gettransaction', [req.query.txid], function(err, btcres) {
    if(err)
      return res.send({messages: ['Bitcoind error: '+err]});
    res.send({tx: btcres});
  });
});

module.exports = server;