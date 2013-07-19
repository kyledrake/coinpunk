coinpunk.controllers.dashboard = {
  loadDashboard: function() {
    $.get('/dashboard', {serverKey: coinpunk.wallet.serverKey}, function(resp) {
      
      $('#transactions').html(new EJS({url: 'views/dashboard/transactions.ejs'}).render({transactions: resp.transactions}));
      $('#addresses').html(new EJS({url: 'views/dashboard/addresses.ejs'}).render({addresses: coinpunk.wallet.addresses()}));

      console.log(resp);
    });
  }
};