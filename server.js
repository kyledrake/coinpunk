var express = require('express');
var argv = require('optimist').argv;
var port = argv.p || 8080;
var app = express();
var redis = require('redis');
var http = require('http');
var bigdecimal = require('bigdecimal');

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
  app.use(function(err, req, res, next){
    console.error(err.stack);
    res.send(500, 'Something broke!');
  });
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

    if(!results) {
      console.log('Bitcoind returned no results');
      res.json({messages: ['Bitcoind error: server returned no information or is down']})
    }

    res.json({
      addresses: results[0].result,
      transactions: results[1].result,
      balance: results[2].result
    });
  });
});

app.get('/tx/details', function(req,res) {
  bitcoin.getTransaction(req.query.txid, function(err, btcres) {
    if(err)
      res.send({messages: ['Bitcoind error: '+err]});
    else
      res.send({tx: btcres.result});
  });
});

/* This is a workaround until the APIs provide Access-Control-Allow-Origin * or JSONP support. */
app.get('/weighted_prices.json', function(req, res) {
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

app.get('/tx/create', function(req, res) {
  bitcoin.listUnspent(1, 9999999, req.query.addresses, function(err, unspentRes) {
    /* res.send({unspentTxs: unspentRes.result}); */
//    bitcoin.createTransaction(
    
  });
});

app.get('/tx/unspent', function(req,res) {
  bitcoin.listUnspent(1, 9999999, req.query.addresses, function(err, btcres) {
    console.log(btcres.result);
    
    /* WHY GOD WHY */
    for(var i=0;i<btcres.result.length; i++) {
      btcres.result[i].amountSatoshiString = bigdecimal.BigDecimal(btcres.result[i].amount.toString()).scaleByPowerOfTen(8).toBigInteger().toString();
    }

    res.send({unspentTxs: btcres.result});
  });
});


[ { txid: '13f17f2d3bfdd4250cc89590c2a833b41767493f0adbaa5362ac2e3a0516100e',
    vout: 1,
    address: '134GKGyWFftj2m4ZFKsBuCbm3GgXfDmuxX',
    account: 'RErMnwLZqmdGXIiWeJ83frHs+FG/CVCQhPXZ14USk9I=',
    scriptPubKey: '76a914168e48aa5551a3ce7339dd55048b976edea3687288ac',
    amount: 0.06,
    confirmations: 979 },
  { txid: 'd266240586fc70f4e3927f3b0a70351179a5f2dbd189aecd31907f8596f0ffc3',
    vout: 1,
    address: '134GKGyWFftj2m4ZFKsBuCbm3GgXfDmuxX',
    account: 'RErMnwLZqmdGXIiWeJ83frHs+FG/CVCQhPXZ14USk9I=',
    scriptPubKey: '76a914168e48aa5551a3ce7339dd55048b976edea3687288ac',
    amount: 0.06,
    confirmations: 975 } ]


console.log("Coinpunk and his rude boys have taken the stage on port "+port);

app.listen(port);


