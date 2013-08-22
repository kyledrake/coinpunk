coinpunk.controllers.Tx = function() {};
coinpunk.controllers.Tx.prototype = new coinpunk.Controller();

coinpunk.controllers.Tx.prototype.details = function(txid) {
  $.get('/api/tx/details', {txid: txid}, function(resp) {
    coinpunk.router.render('view', 'tx/details', {tx: resp.tx});
  });
};

coinpunk.controllers.Tx.prototype.send = function() {
  coinpunk.router.render('view', 'tx/send');
};

coinpunk.controllers.tx = new coinpunk.controllers.Tx();