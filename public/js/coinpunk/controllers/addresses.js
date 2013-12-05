coinpunk.controllers.Addresses = function() {};
coinpunk.controllers.Addresses.prototype = new coinpunk.Controller();

coinpunk.controllers.Addresses.prototype.list = function() {
  this.render('addresses/list', {addresses: coinpunk.wallet.addresses()}, function(id) {
    self.updateExchangeRates(id, false);
  });
}

// FIXME
coinpunk.controllers.Addresses.prototype.generateNewAddress = function(label) {
  var self = this;
  var label = label || '';
  var address = coinpunk.wallet.createNewAddress(label, false);

  this.saveWallet({address: address, override: true}, function() {
    self.template('addresses', 'dashboard/addresses', {addresses: coinpunk.wallet.addresses()});
    $('#newAddressDialog').removeClass('hidden');
    var message = 'Created new address '+address;
    if(label != '')
      var message = message + ' with label '+label;
    $('#newAddressMessage').html(message+'.');
  });
};

coinpunk.controllers.addresses = new coinpunk.controllers.Addresses();