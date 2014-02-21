var controller = require("./controller.js");

var TxController = function (root, express, db, bitcoind, insight) {
  this.bitcoind = bitcoind;
  this.insight = insight;
  controller.Controller.call(this, root, express, db, insight);
};

// Inherit from Controller.
TxController.prototype = new controller.Controller();
TxController.prototype.constructor = TxController;

TxController.prototype._create = function(req, res) {
  this.bitcoind.rpc('sendrawtransaction', [req.body.tx], function(err, btcres) {
    if(err)
      return res.send({messages: ['Bitcoind error: '+err]});
    res.send({hash: btcres});
  });
};

TxController.prototype._search = function(req, res) {
  if (req.body.txHashes) {
    return this._search_hashes(req, res);
  }

  if (req.body.addresses) {
    return this._search_unspent(req, res);
  }

  return res.send([]);
};

TxController.prototype._search_unspent = function(req, res) {
  this.listUnspent(req.body.addresses, function(err, unspent) {
    if(err)
      return res.send({error: 'bitcoinNode'});

    res.send({unspent: unspent});
  });
};

TxController.prototype._search_hashes = function(req,res) {
  var i = 0;
  var queries = [];

  if(!req.body.txHashes) {
    res.send([]);
    return;
  }

  for(i=0;i<req.body.txHashes.length;i++) {
    queries.push({method: 'getrawtransaction', params: [req.body.txHashes[i], 1]});
  }
  this.bitcoind.batch(queries, function(err, results) {
    if(err) console.log(err);

    var txes = [];

    for(var i=0; i<results.length;i++) {
      var result = results[i].result;
      if(result === null)
        continue;

      txes.push({
        hash: result.txid,
        time: result.time,
        amount: result.amount,
        fee: result.fee,
        confirmations: result.confirmations || 0,
        blockhash: result.blockhash,
        blockindex: result.blockindex,
        blocktime: result.blocktime
      });
    }

    res.send(txes);
  });
};

// Export
module.exports.TxController = TxController;
