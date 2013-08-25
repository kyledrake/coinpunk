coinpunk.controllers.Tx = function() {};
coinpunk.controllers.Tx.prototype = new coinpunk.Controller();

coinpunk.controllers.Tx.prototype.details = function(txid) {
  $.get('/api/tx/details', {txid: txid}, function(resp) {
    coinpunk.router.render('view', 'tx/details', {tx: resp.tx});
  });
};

coinpunk.controllers.Tx.prototype.send = function() {
  var self = this;
  $.get('/api/tx/unspent', {addresses: coinpunk.wallet.addressHashes()}, function(resp) {
    
    self.template('view', 'tx/send', resp, function(id) {
      self.updateExchangeRates(id, false);
      $('#'+id+" [rel='tooltip']").tooltip();
    });
    
  });
};

coinpunk.controllers.Tx.prototype.create = function() {
  var self = this;
  var address = $('#createSendForm #address').val();
  var amount = $('#createSendForm #amount').val();
  var errors = [];
  var errorsDiv = $('#errors');
  
  if(address == '')
    errors.push('You cannot have a blank sending address');
  
  if(amount == '' || parseFloat(amount) == 0)
    errors.push('You must have a valid amount to send');
  
  if(errors.length > 0) {
    errorsDiv.removeClass('hidden');
    
    for(var i=0; i<errors.length; i++) {
      $('#errors').html($('#errors').html() + errors[i]+'<br>');
    }
    console.log('derp');
    return;
  }
  
  $.get('/api/tx/unspent', {addresses: coinpunk.wallet.addressHashes()}, function(resp) {

    console.log(address);
    console.log(amount);
    
  });
};

coinpunk.controllers.tx = new coinpunk.controllers.Tx();