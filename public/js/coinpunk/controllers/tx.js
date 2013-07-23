coinpunk.controllers.Tx = function() {};
coinpunk.controllers.Tx.prototype = new coinpunk.Controller();

coinpunk.controllers.Tx.prototype.details = function(txid) {
  var self = this;

  $.get('/tx/details', {txid: txid}, function(resp) {
    coinpunk.router.render('view', 'tx/details', {tx: resp.tx});
  });
};

coinpunk.controllers.tx = new coinpunk.controllers.Tx();