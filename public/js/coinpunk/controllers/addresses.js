coinpunk.controllers.Addresses = function() {};
coinpunk.controllers.Addresses.prototype = new coinpunk.Controller();

coinpunk.controllers.Addresses.prototype.list = function() {
  var self = this;
  this.render('addresses/list', {addresses: coinpunk.wallet.receiveAddresses()}, function(id) {
    self.updateExchangeRates(id);
  });
}

coinpunk.controllers.Addresses.prototype.generateNewAddress = function(label) {
  var self = this;
  var label = label || '';
  var address = coinpunk.wallet.createNewAddress(label, false);

  this.saveWallet({address: address, override: true}, function(response) {
    if(response.result != 'ok') {
      coinpunk.wallet.removeAddress(address);
      $('#newAddressDialog').removeClass('hidden');
      $('#newAddressMessage').text('There was an error creating your address, do not use the new address. Try logging back in, or please try again later.');
      return;
    }

    self.render('addresses/list', {addresses: coinpunk.wallet.addresses()}, function(id) {
      self.updateExchangeRates(id, false);
    });

    $('#newAddressDialog').removeClass('hidden');
    var message = 'Created new address '+address;
    if(label != '')
      var message = message + ' with label '+label;
    $('#newAddressMessage').text(message+'.');
  });
};

coinpunk.controllers.Addresses.prototype.request = function(address) {
  var self = this;
  this.render('addresses/request', {address: address}, function(id) {
    self.drawRequestQR(address);
  });
}

coinpunk.controllers.Addresses.prototype.requestExchangeUpdate = function() {
  var amount = $('#amount').val();
  coinpunk.pricing.getLatest(function(price, currency) {
    var newAmount = parseFloat(price * amount).toFixed(2);
    
    if(newAmount == "NaN")
      return;
    
    $('#amountExchange').val(newAmount);
  });
};

coinpunk.controllers.Addresses.prototype.requestBTCUpdate = function() {
  var amountExchange = $('#amountExchange').val();
  coinpunk.pricing.getLatest(function(price, currency) {
    
    if(amountExchange == 0)
      return;

    var newAmount = parseFloat(amountExchange / price).toFixed(6).replace(/0+$/, '');
    
    if(newAmount == "NaN")
      return;
    
    $('#amount').val(newAmount);
  });
};

coinpunk.controllers.Addresses.prototype.drawRequestQR = function(address) {
  var uri = URI({protocol: 'bitcoin', path: address});
  
  var amount = $('#amount').val();
  var label = $('#label').val();
  var message = $('#message').val();

  if(amount && amount != '' && amount != '0.00')
    uri.addQuery('amount', amount);

  if(label && label != '')
    uri.addQuery('label', label);
    
  if(message && message != '')
    uri.addQuery('message', message);

  $('#qrcode').html('');
  new QRCode(document.getElementById('qrcode'), uri.toString().replace('://', ':'));
}

coinpunk.controllers.addresses = new coinpunk.controllers.Addresses();
