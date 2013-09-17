coinpunk.controllers.Dashboard = function() {};

coinpunk.controllers.Dashboard.prototype = new coinpunk.Controller();

coinpunk.controllers.Dashboard.prototype.index = function() {
  var i = 0;
  var self = this;
  $.get('/api/dashboard', {
    serverKey: coinpunk.wallet.serverKey, 
    addresses: coinpunk.wallet.addressHashes(), 
    receiveAddresses: coinpunk.wallet.receiveAddressHashes()
  }, function(resp) {
    var receivedTransactions = self.filterTransactions(resp.transactions, 'receive');
    var sentTransactions = self.filterTransactions(resp.transactions, 'send');

    // Get confirmations for wallet send TXes
    var txHashes = [];
    for(i=0;i<coinpunk.wallet.transactions.length;i++)
      txHashes.push(coinpunk.wallet.transactions[i].hash);

    $.get('/api/tx/details', {txHashes: txHashes}, function(resp) {
      var txes = coinpunk.wallet.transactions.reverse();
      for(i=0;i<txes.length;i++) {
        for(var j=0;j<resp.length;j++) {
          if(txes[i].hash == resp[j].hash)
            txes[i].confirmations = resp[j].confirmations;
        }
      }
      
      self.template('sentTransactions', 'dashboard/sent', {tx: txes}, function(id) {
        $('#'+id+" [rel='tooltip']").tooltip();
        self.updateExchangeRates(id);
      });
    });



    self.template('receivedTransactions', 'dashboard/received', {category: 'Received', tx: receivedTransactions}, function(id) {
      self.updateExchangeRates('receivedTransactions');
      $('#'+id+" [rel='tooltip']").tooltip();
    });
    self.template('addresses', 'dashboard/addresses', {addresses: coinpunk.wallet.addresses()}, function() {
      $('#balance').text(resp.balance);
    });

    
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