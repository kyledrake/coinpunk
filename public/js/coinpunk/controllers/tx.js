coinpunk.controllers.Tx = function() {};
coinpunk.controllers.Tx.prototype = new coinpunk.Controller();

coinpunk.controllers.Tx.prototype.details = function(txHash) {
  $.get('/api/tx/details', {txHashes: [txHash]}, function(resp) {
    coinpunk.router.render('view', 'tx/details', {tx: resp[0]}, function(id) {
      $('#'+id+" [rel='tooltip']").tooltip();
    });
  });
};

coinpunk.controllers.Tx.prototype.send = function() {
  var self = this;
  
  this.getUnspent(function(resp) {
    coinpunk.router.render('view', 'tx/send', resp, function(id) {
      self.updateExchangeRates(id, false);
      $('#'+id+" [rel='tooltip']").tooltip();
    });
  });
};

coinpunk.controllers.Tx.prototype.create = function() {
  var self = this;
  var sendButton = $('#sendButton');
  sendButton.addClass('disabled');
  var address = $('#createSendForm #address').val();
  var amount = $('#createSendForm #amount').val();
  var errors = [];
  var errorsDiv = $('#errors');

  errorsDiv.addClass('hidden');
  errorsDiv.html('');

  if(address == '')
    errors.push('You cannot have a blank sending address.');
  else {
    try {
      new Bitcoin.Address(address, coinpunk.config.network);
    } catch (e) {
      errors.push('The provided bitcoin address is not valid.');
    }
  }

  var myAddresses = coinpunk.wallet.addresses();
  
  for(var i=0; i<myAddresses.length;i++) {
    if(myAddresses[i].address == address)
      errors.push('You cannot send to your own bitcoin wallet.');
  }

  if(amount == '' || parseFloat(amount) == 0)
    errors.push('You must have a valid amount to send.');
  else if(/^[0-9]+$|^[0-9]+\.[0-9]+$|^\.[0-9]+$/.exec(amount) === null)
    errors.push('You must have a valid amount to send.');

  if(errors.length > 0) {
    this.displayErrors(errors, errorsDiv);
    sendButton.removeClass('disabled');
    return;
  }

  this.getUnspent(function(resp) {
    if(resp.amount < amount) {
      errors.push('Cannot spend more bitcoins than you currently have.');
      self.displayErrors(errors, errorsDiv);
      sendButton.removeClass('disabled');
      return;
    }

    var changeAddress = coinpunk.wallet.createNewAddress('change', true);
    var rawtx = coinpunk.wallet.createSend(amount, '0', address, changeAddress);
    
    self.saveWallet({override: true, address: changeAddress}, function(response) {
      $.post('/api/tx/send', {tx: rawtx}, function(resp) {
        coinpunk.database.setSuccessMessage("Sent "+amount+" BTC to "+address+".");
        coinpunk.router.route('dashboard');
      });
    });
  });
};

coinpunk.controllers.Tx.prototype.displayErrors = function(errors, errorsDiv) {
  if(errors.length > 0) {
    errorsDiv.removeClass('hidden');
    
    for(var i=0; i<errors.length; i++) {
      $('#errors').html($('#errors').html() + errors[i]+'<br>');
    }
    return;
  }
};

coinpunk.controllers.tx = new coinpunk.controllers.Tx();