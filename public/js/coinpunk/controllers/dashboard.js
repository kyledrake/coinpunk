coinpunk.controllers.Dashboard = function() {};

coinpunk.controllers.Dashboard.prototype = new coinpunk.Controller();

coinpunk.controllers.Dashboard.prototype.index = function() {
  var i = 0;
  var self = this;

  this.getUnspent(function(resp) {
    
    coinpunk.router.render('view', 'dashboard', {}, function() {
      $('#balance').text(resp.amount);
    });

    var txHashes = [];    
    var txs = coinpunk.wallet.transactions;

    for(i=0;i<txs.length;i++) {
      txHashes.push(txs[i].hash);
    }

    $.get('/api/tx/details', {txHashes: txHashes}, function(resp) {
      for(i=0;i<txs.length;i++) {
        for(var j=0;j<resp.length;j++) {
          if(txs[i].hash == resp[j].hash)
            txs[i].confirmations = resp[j].confirmations;
        }
      }
      
      var stxs = [];
      for(i=0;i<txs.length;i++)
        if(txs[i].type == 'send')
          stxs.push(txs[i]);

      var rtxs = [];
      for(i=0;i<txs.length;i++)
        if(txs[i].type == 'receive')
          rtxs.push(txs[i]);

      self.template('sentTransactions', 'dashboard/sent', {tx: stxs}, function(id) {
        $('#'+id+" [rel='tooltip']").tooltip();
        self.updateExchangeRates(id);
      });

      self.template('receivedTransactions', 'dashboard/received', {category: 'Received', tx: rtxs}, function(id) {
        self.updateExchangeRates('receivedTransactions');
        $('#'+id+" [rel='tooltip']").tooltip();
      });
    });

    self.template('addresses', 'dashboard/addresses', {addresses: coinpunk.wallet.addresses()});
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

coinpunk.controllers.dashboard = new coinpunk.controllers.Dashboard();