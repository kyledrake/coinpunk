coinpunk.controllers.Dashboard = function() {};

coinpunk.controllers.Dashboard.prototype = new coinpunk.Controller();

coinpunk.controllers.Dashboard.prototype.index = function() {
  var self = this;

  $.get('/dashboard', {serverKey: coinpunk.wallet.serverKey}, function(resp) {
    $('#transactions').html(self.ejs('dashboard/transactions.ejs', {transactions: resp.transactions}));
    $('#addresses').html(self.ejs('dashboard/addresses.ejs', {addresses: coinpunk.wallet.addresses()}));
  });
};

coinpunk.controllers.dashboard = new coinpunk.controllers.Dashboard();