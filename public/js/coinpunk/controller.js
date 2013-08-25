coinpunk.Controller = function() {
};

coinpunk.Controller.prototype.template = function(id, path, data, callback) {
  $.get('views/'+path+'.html', function(res) {
    $('#'+id).html(_.template(res, data, {variable: 'data'}));
    
    if(callback)
      callback(id);
  });
};

coinpunk.Controller.prototype.friendlyTimeString = function(timestamp) {
  var date = new Date(timestamp*1000);
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