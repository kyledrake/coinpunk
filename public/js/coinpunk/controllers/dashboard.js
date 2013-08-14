coinpunk.controllers.Dashboard = function() {};

coinpunk.controllers.Dashboard.prototype = new coinpunk.Controller();

coinpunk.controllers.Dashboard.prototype.index = function() {
  var self = this;
  $.get('/api/dashboard', {serverKey: coinpunk.wallet.serverKey, addresses: coinpunk.wallet.addressHashes()}, function(resp) {
    var receivedTransactions = self.filterTransactions(resp.transactions, 'receive');
    var sentTransactions = self.filterTransactions(resp.transactions, 'send');

    self.template('sentTransactions', 'dashboard/transactions', {category: 'Sent', tx: sentTransactions}, function(id) {
      $('#'+id+" [rel='tooltip']").tooltip();
      self.updateExchangeRates(id);
    });
    self.template('receivedTransactions', 'dashboard/transactions', {category: 'Received', tx: receivedTransactions}, function(id) {
      self.updateExchangeRates('receivedTransactions');
      $('#'+id+" [rel='tooltip']").tooltip();
    });
    self.template('addresses', 'dashboard/addresses', {addresses: coinpunk.wallet.addresses()});

    $('#balance').text(resp.balance);
    
  });
};

coinpunk.controllers.Dashboard.prototype.updateExchangeRates = function(id) {
  coinpunk.pricing.getLatest(function(price, currency) {
    $('#balanceExchange').text(' ≈ '+ parseFloat(price * $('#balance').text()).toFixed(2) + ' ' + currency);
    $('#exchangePrice').html('1 BTC ≈ ' + price + ' ' + currency + '<br><small><a href="http://bitcoincharts.com" target="_blank">Bitcoin Charts</a></small>');

    $('#'+id+' .exchangePrice').remove();

    var prices = $('#'+id+' .addExchangePrice');
    for(var i=0;i<prices.length;i++) {
      $(prices[i]).append('<span class="exchangePrice pull-right"><small>'+($(prices[i]).text().split(' ')[0] * price).toFixed(2)+' ' +currency+'</small></span>');
    }
  });
};

coinpunk.controllers.Dashboard.prototype.filterTransactions = function(txs, category) {
  var filteredTxs = [];
  for(var i=0;i<txs.length;i++) {
    if(txs[i].category == category) {
      filteredTxs.push(txs[i]);
    }
  }

  return filteredTxs.reverse();
};

coinpunk.controllers.dashboard = new coinpunk.controllers.Dashboard();