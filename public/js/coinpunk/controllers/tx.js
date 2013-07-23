coinpunk.controllers.Tx = function() {};
coinpunk.controllers.Tx.prototype = new coinpunk.Controller();

coinpunk.controllers.Tx.prototype.details = function(txid) {
  var self = this;

  $.get('/tx', {txid: txid}, function(resp) {
    
  });

  $.get('/dashboard', {serverKey: coinpunk.wallet.serverKey}, function(resp) {
    $('#transactions').html(self.ejs('dashboard/transactions.ejs', {tx: resp.transactions}));
    $('#addresses').html(self.ejs('dashboard/addresses.ejs', {addresses: coinpunk.wallet.addresses()}));
  });
};

coinpunk.controllers.dashboard = new coinpunk.controllers.Dashboard();