coinpunk.Controller = function() {
};

coinpunk.Controller.prototype.getUnspent = function(callback) {
  var self = this;
  $.get('/api/tx/unspent', {addresses: coinpunk.wallet.addressHashes()}, function(resp) {
    coinpunk.wallet.mergeUnspent(resp.unspent);
    self.saveWallet();

    if(callback)
      callback(resp);
  });
};

coinpunk.Controller.prototype.saveWallet = function(opts) {
  var opts = opts || {};
  var data = opts.data || {};

  data.serverKey = coinpunk.wallet.serverKey;
  data.wallet = coinpunk.wallet.encryptPayload();

  $.ajax({
    type: 'POST',
    url: '/api/wallet',
    data: data,
    dataType: 'json',
    success: function(response) {
      if(opts.callback)
        opts.callback(response);
    }
  });
};

coinpunk.Controller.prototype.template = function(id, path, data, callback) {
  $.get('views/'+path+'.html', function(res) {
    $('#'+id).html(_.template(res, data, {variable: 'data'}));
    
    if(callback)
      callback(id);
  });
};

coinpunk.Controller.prototype.friendlyTimeString = function(timestamp) {
  var date = new Date(timestamp);
  return date.toLocaleString();
};

coinpunk.Controller.prototype.updateExchangeRates = function(id) {
  coinpunk.pricing.getLatest(function(price, currency) {
    $('#balanceExchange').text(' ≈ '+ parseFloat(price * $('#balance').text()).toFixed(2) + ' ' + currency);
    $('#exchangePrice').html('1 BTC ≈ ' + price + ' ' + currency + '<br><small><a href="http://bitcoincharts.com" target="_blank">Bitcoin Charts</a></small>');

    $('#'+id+' .exchangePrice').remove();

    var prices = $('#'+id+' .addExchangePrice');
    for(var i=0;i<prices.length;i++) {
      $(prices[i]).append('<span class="exchangePrice"><small>'+($(prices[i]).text().split(' ')[0] * price).toFixed(2)+' ' +currency+'</small></span>');
    }
  });
};

coinpunk.Controller.prototype.minimumSendConfirmations = 1;
coinpunk.Controller.prototype.minimumStrongSendConfirmations = 6;

coinpunk.controllers = {};