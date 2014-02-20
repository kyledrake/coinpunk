coinpunk.controllers.Tx = function() {};
coinpunk.controllers.Tx.prototype = new coinpunk.Controller();

coinpunk.controllers.Tx.prototype.defaultFee = '0.0001';
coinpunk.controllers.Tx.prototype.minimumConfirmationsToSpend = 1;

coinpunk.controllers.Tx.prototype.details = function(txHash) {
  var self = this;
  $.post('/api/tx/details', {txHashes: [txHash]}, function(resp) {
    self.render('tx/details', {tx: resp[0]}, function(id) {
      $('#'+id+" [rel='tooltip']").tooltip();
    });
  });
};

coinpunk.controllers.Tx.prototype.send = function() {
  var self = this;

  this.getUnspent(function(resp) {
    coinpunk.router.render('view', 'tx/send', {balance: coinpunk.wallet.safeUnspentBalance()}, function(id) {
      self.updateExchangeRates(id, false);
      $('#'+id+" [rel='tooltip']").tooltip();
    });
  });
};

coinpunk.controllers.Tx.prototype.sendExchangeUpdate = function() {
  var self = this;
  var amount = $('#amount').val();
  coinpunk.pricing.getLatest(function(price, currency) {
    var newAmount = parseFloat(price * amount).toFixed(2);

    if(newAmount == "NaN")
      return;

    var amountExchange = $('#amountExchange');

    if(amountExchange.val() != newAmount) {
      $('#amountExchange').val(newAmount);
      self.calculateFee();
    }
  });
};

coinpunk.controllers.Tx.prototype.sendBTCUpdate = function() {
  var self = this;
  var amountExchange = $('#amountExchange').val();
  coinpunk.pricing.getLatest(function(price, currency) {
    
    if(amountExchange == 0)
      return;

    var newAmount = parseFloat(amountExchange / price).toFixed(6).replace(/\.0+$/, '');
    
    if(newAmount == "NaN")
      return;
    
    var amount = $('#amount');
    
    if(amount.val() != newAmount) {
      amount.val(newAmount);
      self.calculateFee();
    }
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
  
  this.calculateFee();
  var calculatedFee = $('#calculatedFee').val();

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
  else if(coinpunk.wallet.safeUnspentBalance().lessThan(new BigNumber(amount).plus(calculatedFee))) {
    errors.push('Cannot spend more bitcoins than you currently have.');
  }

  if(errors.length > 0) {
    this.displayErrors(errors, errorsDiv);
    sendButton.removeClass('disabled');
    return;
  }

  var changeAddress = $('#changeAddress').val();

  if(changeAddress == '')
    changeAddress = coinpunk.wallet.createNewAddress('change', true);

  var rawtx = coinpunk.wallet.createSend(amount, calculatedFee, address, changeAddress);

  self.saveWallet({override: true, address: changeAddress}, function(response) {
    if(response.result == 'error' && response.messages[0] == 'Invalid session key') {
      self.displayErrors(['Fatal error: invalid session key, tx was not sent, logging out'], errorsDiv);
      delete coinpunk.wallet;
    } else if(response.result != 'ok') {
      self.displayErrors(['An unknown error has occured, tx was not sent. Logging out. Please try again later.'], errorsDiv);
      delete coinpunk.wallet;
    } else {
      $.post('/api/tx/send', {tx: rawtx}, function(resp) {
        coinpunk.database.setSuccessMessage("Sent "+amount+" BTC to "+address+".");

        self.getUnspent(function() {
          coinpunk.router.route('dashboard');
        });
      });
    }
  });
};

coinpunk.controllers.Tx.prototype.displayErrors = function(errors, errorsDiv) {
  if(errors.length > 0) {
    errorsDiv.removeClass('hidden');
    
    for(var i=0; i<errors.length; i++) {
      $('#errors').html($('#errors').html()+coinpunk.utils.stripTags(errors[i])+'<br>');
    }
    return;
  }
};

coinpunk.controllers.Tx.prototype.calculateFee = function() {
  var address = $('#address').val();
  var amount = $('#amount').val();
  var sendAmount = $('#sendAmount');

  if(amount == sendAmount.val())
    return;
  else
    sendAmount.val(amount);

  if(address == '' || amount == '')
    return;

  var changeAddress = $('#changeAddress').val();
  var calculatedFee = $('#calculatedFee').val();

  if(changeAddress == '') {
    changeAddress = coinpunk.wallet.createNewAddress('change', true);
    $('#changeAddress').val(changeAddress);
  }

  var calculatedFee = coinpunk.wallet.calculateFee(amount, address, changeAddress);
  $('#calculatedFee').val(calculatedFee);
  $('#fee').text(coinpunk.wallet.calculateFee(amount, address, changeAddress)+' BTC');
  this.updateExchangeRates('container', false);
};

coinpunk.controllers.Tx.prototype.scanQR = function(event) {

  // DOM elements
  var errorsDiv = $("#errors");
  var addressInput = $("#address");
  var amountInput = $("#amount");

  // Clear any existing info
  errorsDiv.addClass('hidden').html('');
  addressInput.val("");
  amountInput.val("");

  // Validate the image file
  var files = event.target.files;
  var wrongImageCount = files.length != 1;
  var incorrectMimetype = files[0].type.indexOf("image/") != 0
  if(wrongImageCount || incorrectMimetype) {
    var msg = 'You must provide only one image file.';
    this.displayErrors([msg], errorsDiv);
    return
  }

  // Scan success handler
  function scanSuccess(result) {
    var uri = new URI(result);

    if(uri.protocol() == '') {
      addressInput.val(uri.toString());
      coinpunk.controllers.tx.calculateFee()
      return;
    }

    if(uri.protocol() != 'bitcoin') {
      errorsDiv
        .removeClass('hidden')
        .text('Not a valid Bitcoin QR code.');
      return;
    }

    var address = uri.path();
    if(!address || address == '') {
      errorsDiv
        .removeClass('hidden')
        .text('No Bitcoin address found in QR code.');
      return;
    }

    addressInput.val(address);

    var queryHash = uri.search(true);

    if(queryHash.amount) {
      amountInput.val(queryHash.amount);
      coinpunk.controllers.tx.sendExchangeUpdate();
      coinpunk.controllers.tx.calculateFee();
    }
  }

  // Scan error handler
  function scanError() {
    errorDiv
      .removeClass('hidden')
      .text('Could not process the QR code, the image may be blurry. Please try again.');
    return
  }

  // Scan the image for a qr
  var src = URL.createObjectURL(event.target.files[0]);
  var img = new QrImageDecoder({
    src: src,
    success: scanSuccess,
    error: scanError
  });

};

coinpunk.controllers.tx = new coinpunk.controllers.Tx();
