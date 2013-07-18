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

app.post('/wallet', function(req,res) {
  db.set(req.body.serverKey, req.body.wallet, function(err) {
    if(err) {
      res.json({messages: ["Database error: "+err]});
    } else {
      btc.cmd('importaddress', req.body.address, req.body.serverKey, false, function(err, btcres) {
        if(err) {
          res.json({messages: ['Bitcoind error: '+err]});
        } else {
          res.json({result: 'ok'});
        }
      });
    }
  });
});

app.get('/accounts/info', function(req,res) {
  async.parallel([
      function(){
        btc.cmd('getaddressesbyaccount', req.query.email);
      },
      function(){
        btc.cmd('listtransactons', email);
      },
      function() {
        btc.cmd('getbalance', email)
      }
  ], callback);

  btc.cmd('', function(req,res) {
    
  });
});

/*
  client.rpc 'getaddressesbyaccount', account.email
  client.rpc 'listtransactions', account.email
  client.rpc 'getbalance', account.email
end

@addresses_received = $bitcoin.batch do
  addresses_raw['result'].each {|a| rpc 'getreceivedbyaddress', a}
end.collect{|a| a['result']}

@account            = account
@addresses          = addresses_raw['result']
@transactions       = transactions_raw['result']
@account_balance    = account_balance_raw['result']

*/

console.log("Coinpunk and his punk band have taken the stage on port "+port);

app.listen(port);