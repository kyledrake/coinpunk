var Controller = function (root, express, db, insight) {
  this.db = db;
  this.insight = insight;

  if (!express) {
    return;
  }

  // Set up RESTful routes.
  express.post(root, this._create.bind(this));
  express.post([root, 'search'].join('/'), this._search.bind(this));
  express.get([root, ':id'].join('/'), this._read.bind(this));
  express.get(root, this._list.bind(this));
  express.put([root, ':id'].join('/'), this._update.bind(this));
  express.delete([root, ':id'].join('/'), this._delete.bind(this));
};

/**
 * Returns an error message to the JS client.
 */
Controller.prototype.errorResponse = function (errors) {
  if(typeof errors == 'string')
    errors = [errors];
  return {messages: errors};
};

Controller.prototype.notFound = function(req, res) {
  res.send(404);
};

// Method stubs. All 404 by default.
Controller.prototype._create = Controller.prototype.notFound; 
Controller.prototype._search = Controller.prototype.notFound; 
Controller.prototype._read = Controller.prototype.notFound; 
Controller.prototype._list = Controller.prototype.notFound; 
Controller.prototype._update = Controller.prototype.notFound; 
Controller.prototype._delete = Controller.prototype.notFound; 


Controller.prototype.listUnspent = function (addresses, callback) {
  if (!this.insight) return callback(new Error('no insight object'));

  this.insight.listUnspent(addresses, function(err, btcres) {
    if(err) {
      return callback(err);
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
    callback(undefined, unspent);
  });
};



module.exports.Controller = Controller;
