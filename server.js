var express = require('express');
var argv = require('optimist').argv;
var port = argv.p || 8080;
var app = express();
var redis = require('redis');
var http = require('http');

var config = require('./config.json');

var bitcoin = require('libcoin/RpcClient').new({
  'port' : config.bitcoind.port,
  'user' : config.bitcoind.rpcuser,
  'pass' : config.bitcoind.rpcpassword,
  'protocol' : config.bitcoind.protocol
});

var db = redis.createClient(null, null);

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.static('public'));
});

app.get('/wallet', function(req,res) {
  db.get(req.query.serverKey, function(err, wallet) {
    if(err) console.log("Wallet Get Error: "+err);

    if(wallet)
      res.send({wallet: wallet});
    else
      res.send({result: 'error', message: 'Wallet not found'});
  });
});

app.post('/wallet', function(req,res) {
  db.get(req.body.serverKey, function(err, wallet) {
    if(err) {
      console.log("Wallet Get Error: "+err);
      res.send({messages: ['Bitcoind error: '+err]});
    } else if(wallet) {
      res.send({result: 'exists', wallet: wallet});
    } else {
      db.set(req.body.serverKey, req.body.wallet, function(err) {
        if(err) {
          res.send({messages: ["Database error: "+err]});
        } else {
          bitcoin.importAddress(req.body.address, req.body.serverKey, "false", function(err, btcres) {
            if(err)
              res.send({messages: ['Bitcoind error: '+err]});
            else
              res.send({result: 'ok'});
          });
        }
      });
    }
  });
});

app.get('/dashboard', function(req,res) {

  bitcoin.batch(function() {
    bitcoin.getAddressesByAccount(req.query.serverKey);
    bitcoin.listTransactions(req.query.serverKey);
    bitcoin.getBalance(req.query.serverKey);
  }, function(err, results) {
    if(err) console.log(err);

    res.json({
      addresses: results[0].result,
      transactions: results[1].result,
      balance: results[2].result
    });
  });
});

console.log("Coinpunk and his rude boys have taken the stage on port "+port);

app.listen(port);
