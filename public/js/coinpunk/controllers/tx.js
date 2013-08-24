coinpunk.controllers.Tx = function() {};
coinpunk.controllers.Tx.prototype = new coinpunk.Controller();

coinpunk.controllers.Tx.prototype.details = function(txid) {
  $.get('/api/tx/details', {txid: txid}, function(resp) {
    coinpunk.router.render('view', 'tx/details', {tx: resp.tx});
  });
};

coinpunk.controllers.Tx.prototype.send = function() {
  var self = this;
  $.get('/api/tx/unspent', {addresses: coinpunk.wallet.addressHashes()}, function(resp) {
    
    self.template('view', 'tx/send', resp, function(id) {
      self.updateExchangeRates(id, false);
      $('#'+id+" [rel='tooltip']").tooltip();
    });
    
  });
};

coinpunk.controllers.tx = new coinpunk.controllers.Tx();