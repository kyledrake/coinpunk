var express = require('express');
var argv = require('optimist').argv;
var port = argv.p || 8080;
var app = express();
var redis = require('redis');
var bitcoin = require('bitcoin');

var config = require('./config.json');

var db = redis.createClient(null, null);

var btc = new bitcoin.Client({
  host: config.bitcoinRpcHost || 'localhost',
  port: config.bitcoinRpcPort || 8332,
  user: config.bitcoinRpcUser,
  pass: config.bitcoinRpcPass
});

app.configure(function() {
  app.use(express.bodyParser());
  app.use(express.static('public'));
});

app.post('/accounts/create', function(req,res) {
  console.log(req.body);

  db.hmset(req.body.email, {
    verificationKey: req.body.verification_key,
    verificationSalt: req.body.verification_salt,
    wallet: req.body.wallet
  }, function(err) {
    if(err) {
      res.json({messages: ["Database error: "+err]});
    } else {
      console.log('DERP '+req.body.initial_public_address);
      btc.cmd('importaddress', req.body.initial_public_address, req.body.email, function(err, btcres) {
        if(err)
          console.log('bitcoind error: '+err);
          res.json({messages: ['Bitcoind error: '+err]});

        console.log('BTCRES: '+btcres);
      });
      
      res.json({result: 'ok'});
    }
  });
});

console.log("Coinpunk and his punk band have taken the stage on port "+port);

app.listen(port);