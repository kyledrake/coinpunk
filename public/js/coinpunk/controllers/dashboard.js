coinpunk.controllers.Dashboard = function() {};

coinpunk.controllers.Dashboard.prototype = new coinpunk.Controller();

coinpunk.controllers.Dashboard.prototype.index = function() {
  var self = this;
console.log(coinpunk.wallet.addresses());
  $.get('/api/dashboard', {serverKey: coinpunk.wallet.serverKey, addresses: coinpunk.wallet.addressHashes()}, function(resp) {
    var receivedTransactions = self.filterTransactions(resp.transactions, 'receive');
    var sentTransactions = self.filterTransactions(resp.transactions, 'send');

    $('#sentTransactions').html(self.ejs('dashboard/transactions.ejs', {category: 'Sent', tx: sentTransactions}));
    $('#receivedTransactions').html(self.ejs('dashboard/transactions.ejs', {category: 'Received', tx: receivedTransactions}));
    $('#addresses').html(self.ejs('dashboard/addresses.ejs', {addresses: coinpunk.wallet.addresses()}));
    $('#balance').text(resp.balance);
    self.updateExchangeRates();
    $("[rel='tooltip']").tooltip();
  });
};

coinpunk.controllers.Dashboard.prototype.updateExchangeRates = function() {
  coinpunk.pricing.getLatest(function(price, currency) {
    $('#balanceExchange').text(' ≈ '+ parseFloat(price * $('#balance').text()).toFixed(2) + ' ' + currency);
    $('#exchangePrice').html('1 BTC ≈ ' + price + ' ' + currency + '<br><small><a href="http://bitcoincharts.com" target="_blank">Bitcoin Charts</a></small>');

    $('.exchangePrice').remove();

    var prices = $('.addExchangePrice');
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