coinpunk.controllers.Accounts = function() {};

coinpunk.controllers.Accounts.prototype = new coinpunk.Controller();

coinpunk.controllers.Accounts.prototype.passwordStrength = {
  enabled: false,

  enable: function() {
    if(this.enabled === true)
      return;

    this.enabled = true;
    $.strength("#email", "#password", function(username, password, strength){
      $("#progressBar").css('width', strength.score+'%');
      var status = strength.status.charAt(0).toUpperCase() + strength.status.slice(1);
      $('#passwordStrengthStatus').text(status);
    });
  }
}

coinpunk.controllers.Accounts.prototype.signin = function() {
  var id = $('#walletId').val();
  var password = $('#password').val();
  var errorDiv = $('#errors');
  errorDiv.addClass('hidden');
  errorDiv.html('');
  
  coinpunk.wallet = new coinpunk.Wallet();
  
  var walletKey = coinpunk.wallet.createWalletKey(id, password);
  var payload   = coinpunk.wallet.encryptPayload();
  
  $.get('/api/wallet', {serverKey: coinpunk.wallet.serverKey}, function(response) {
    if(response.result == 'error') {
      errorDiv.removeClass('hidden');
      errorDiv.html(response.message);
    } else {
      errorDiv.addClass('hidden');
      coinpunk.wallet.loadPayload(response.wallet);
      coinpunk.wallet.storeCredentials();
      coinpunk.router.route('dashboard');
    }
  });
}

coinpunk.controllers.Accounts.prototype.disableSubmitButton = function() {
  var button = $('#createAccountButton');
  button.attr('disabled', 'disabled');
  button.removeClass('btn-success');
  button.text('Creating account, please wait..');
}

coinpunk.controllers.Accounts.prototype.enableSubmitButton = function() {
  var button = $('#createAccountButton');
  button.removeAttr('disabled');
  button.addClass('btn-success');
  button.text('Create Account');
}

coinpunk.controllers.Accounts.prototype.create = function() {
  var email = $('#email').val();
  var password = $('#password').val();
  var passwordConfirm = $('#password_confirm').val();
  var errors = [];

  if(/.+@.+\..+/.exec(email) === null)
    errors.push('Email is not valid.');

  if(password === '')
    errors.push('Password cannot be blank.')

  if(password != passwordConfirm)
    errors.push('Passwords do not match.');
  
  //if(password.length < 10)
  //  errors.push('Password must be at least 10 characters.');

  var errorsDiv = $('#errors');

  if(errors.length > 0) {
    errorsDiv.html('');
    for(var i=0;i<errors.length;i++) {
      errorsDiv.html(errorsDiv.html() + errors[i] + '<br>');
    }
    $('#errors').removeClass('hidden');
  } else {
    $('#errors').addClass('hidden');

    this.disableSubmitButton();

    coinpunk.wallet = new coinpunk.Wallet();
    var address   = coinpunk.wallet.createNewAddress('Default');
    var walletKey = coinpunk.wallet.createWalletKey(email, password);
    
    this.saveWallet({address: address, email: email}, function(response) {
      if(response.result == 'ok') {
        coinpunk.wallet.storeCredentials();
        coinpunk.router.route('dashboard');
      } else if(response.result == 'exists'){
        coinpunk.wallet.loadPayload(response.wallet);
        coinpunk.wallet.storeCredentials();
        coinpunk.router.route('dashboard');
      } else {
        errorsDiv.html('');
        for(var i=0;i<response.messages.length;i++) {
          errorsDiv.html(errorsDiv.html() + response.messages[i] + '<br>');
        }
        $('#errors').removeClass('hidden');
        self.enableSubmitButton();
      }
    });
  }
}

coinpunk.controllers.Accounts.prototype.performImport = function(id, password) {
  var id = $('#importId').val();
  var password = $('#importPassword').val();
  var file = $('#importFile').get(0).files[0];
  var self = this;
  var reader = new FileReader();

  reader.onload = (function(walletText) {
    coinpunk.wallet = new coinpunk.Wallet();
    try {
      coinpunk.wallet.loadPayloadWithLogin(id, password, walletText.target.result);
    } catch(e) {
      $('#importErrorDialog').removeClass('hidden');
      $('#importErrorMessage').text('Wallet import failed. Check the credentials and wallet file.');
      return;
    }

    if(coinpunk.wallet.transactions && coinpunk.wallet.addresses()) {
      var payload = coinpunk.wallet.encryptPayload();

      self.saveWallet({importAddresses: coinpunk.wallet.addressHashes()}, function(resp) {
        if(resp.result == 'exists') {
          $('#importErrorDialog').removeClass('hidden');
          $('#importErrorMessage').text('Cannot import your wallet, because the wallet already exists on this server.');
          return;
        } else {
          coinpunk.wallet.storeCredentials();
          coinpunk.router.route('dashboard');
        }
      });
    } else {
      $('#importErrorDialog').removeClass('hidden');
      $('#importErrorMessage').text('Not a valid wallet backup file.');
    }
  });

  try {
    reader.readAsText(file);
  } catch(e) {
    $('#importErrorDialog').removeClass('hidden');
    $('#importErrorMessage').text('You must provide a wallet backup file.');
  }
};

coinpunk.controllers.accounts = new coinpunk.controllers.Accounts();