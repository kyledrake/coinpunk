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

  if(amount == '' || parseFloat(amount) == 0) {
    errors.push('You must have a valid amount to send.');
  } else if(/^[0-9]+$|^[0-9]+\.[0-9]+$|^\.[0-9]+$/.exec(amount) === null) {
    errors.push('You must have a valid amount to send.');
  } else if(coinpunk.wallet.safeUnspentBalance().lessThan(new BigNumber(amount).plus(calculatedFee))) {
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

  self.saveWallet({override: true, address: changeAddress}, function(response) {
    if(response.result == 'error' && response.messages[0] == 'Invalid session key') {
      self.displayErrors(['Fatal error: invalid session key, tx was not sent, logging out'], errorsDiv);
      delete coinpunk.wallet;
    } else if(response.result != 'ok') {
      self.displayErrors(['An unknown error has occured, tx was not sent. Logging out. Please try again later.'], errorsDiv);
      delete coinpunk.wallet;
    } else {

      var tx = coinpunk.wallet.createTx(amount, calculatedFee, address, changeAddress);
      $.post('/api/tx/send', {tx: tx.raw}, function(resp) {
        if (resp.error) {
          self.displayErrors(resp.messages, errorsDiv);
          sendButton.removeClass('disabled');
          return;
        }
        else {
          coinpunk.wallet.createSend(amount, calculatedFee, address, tx);
          coinpunk.database.setSuccessMessage("Sent "+amount+" BTC to "+address+".");

          self.getUnspent(function() {
            coinpunk.router.route('dashboard');
          });
        }
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
  var errorsDiv = $('#errors');
  var self = this;

  errorsDiv.addClass('hidden');
  errorsDiv.html('');

  if(event.target.files.length != 1 && event.target.files[0].type.indexOf("image/") != 0)
    return this.displayErrors(['You must provide only one image file.'], errorsDiv);

  qrcode.callback = function(result) {
    if(result === 'error decoding QR Code')
      return errorsDiv.removeClass('hidden').text('Could not process the QR code, the image may be blurry. Please try again.');

      console.log(result)

    var uri = new URI(result);

    if(uri.protocol() == '') {
      $('#address').val(uri.toString());
      coinpunk.controllers.tx.calculateFee()
      return;
    }

    if(uri.protocol() != 'bitcoin')
      return errorsDiv.removeClass('hidden').text('Not a valid Bitcoin QR code.');
    
    var address = uri.path();
    if(!address || address == '')
      return errorsDiv.removeClass('hidden').text('No Bitcoin address found in QR code.');

    $('#address').val(address);
    
    var queryHash = uri.search(true);
    
    if(queryHash.amount) {
      $('#amount').val(queryHash.amount);
      coinpunk.controllers.tx.sendExchangeUpdate();
      coinpunk.controllers.tx.calculateFee();
    }
  }

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  var img = new Image();
  img.onload = function() {
    /*
    Helpful URLs: 
    http://hacks.mozilla.org/2011/01/how-to-develop-a-html5-image-uploader/
    http://stackoverflow.com/questions/19432269/ios-html5-canvas-drawimage-vertical-scaling-bug-even-for-small-images
  
    There are a lot of arbitrary things here. Help to clean this up welcome.
    
    context.save();
    context.scale(1e6, 1e6);
    context.drawImage(img, 0, 0, 1e-7, 1e-7, 0, 0, 1e-7, 1e-7);
    context.restore();
    */

    if((img.width == 2448 && img.height == 3264) || (img.width == 3264 && img.height == 2448)) {
      canvas.width = 1024;
      canvas.height = 1365;
      context.drawImage(img, 0, 0, 1024, 1365);
    } else if(img.width > 1024 || img.height > 1024) {
      canvas.width = img.width*0.15;
      canvas.height = img.height*0.15;
      context.drawImage(img, 0, 0, img.width*0.15, img.height*0.15);
    } else {
      canvas.width = img.width;
      canvas.height = img.height;
      context.drawImage(img, 0, 0, img.width, img.height);
    }

    qrcode.decode(canvas.toDataURL('image/png'));
  }

  img.src = URL.createObjectURL(event.target.files[0]);
};

coinpunk.controllers.tx = new coinpunk.controllers.Tx();
