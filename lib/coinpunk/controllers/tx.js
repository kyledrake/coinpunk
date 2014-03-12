var controller = require("./controller.js");

var TxController = function (root, express, db, insight) {
  this.insight = insight;
  controller.Controller.call(this, root, express, db, insight);
};

// Inherit from Controller.
TxController.prototype = new controller.Controller();
TxController.prototype.constructor = TxController;

TxController.prototype._create = function(req, res) {

  this.insight.sendRawTransaction(req.body.tx, function(err, txid) {
    if (err) {
      return res.send({ error: 'insightServer', messages: [err]});
    }
    res.send({ hash: txid });
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
      return res.send({error: 'insightServer' });

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

  this.insight.getTransactions(req.body.txHashes, function(err, results) {
    if(err) console.log(err);

    var txes = [];

    for(var i=0; i<results.length;i++) {
      var result = results[i];
      if(result === null)
        continue;

      txes.push({
        hash: result.txid,
        time: result.time,
        amount: result.amount,
        fee: result.fees,
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
