coinpunk.controllers.Accounts = function() {};

coinpunk.controllers.Accounts.prototype = new coinpunk.Controller();

coinpunk.controllers.Accounts.prototype.requiredPasswordLength = 10;

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
  var self = this;
  var id = $('#walletId').val();
  var password = $('#password').val();
  var errorDiv = $('#errors');
  errorDiv.addClass('hidden');
  errorDiv.html('');

  var wallet = new coinpunk.Wallet();

  var walletKey = wallet.createWalletKey(id, password);
  var payload   = wallet.encryptPayload();

  var body = {serverKey: wallet.serverKey};

  var authCode = $('#authCode');
  if(authCode)
    body.authCode = authCode.val();

  $.get('/api/wallet', body, function(response) {
    if(response.result == 'error') {
      errorDiv.removeClass('hidden');
      errorDiv.text(response.message);
    } else if(response.result == 'authCodeNeeded') {
      errorDiv.removeClass('hidden');
      errorDiv.text(response.message);
      $('#signinPassword').after('
        <div class="form-group">
          <label for="authCode" class="col-lg-2 control-label">Auth Code</label>
          <div class="col-lg-4">
            <input id="authCode" type="password" class="form-control" placeholder="">
          </div>
        </div>
      ');
      $('#authCode').focus();
      coinpunk.usingAuthKey = true;

    } else {
      errorDiv.addClass('hidden');
      wallet.loadPayload(response.wallet);
      wallet.sessionKey = response.sessionKey;
      coinpunk.wallet = wallet;
      coinpunk.router.listener();
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
  button.html('<i class="fa fa-user"></i> Create Account');
}

coinpunk.controllers.Accounts.prototype.create = function() {
  var self = this;
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

  if(password.length < this.requiredPasswordLength)
    errors.push('Password must be at least 10 characters.');

  var errorsDiv = $('#errors');

  if(errors.length > 0) {
    errorsDiv.html('');
    for(var i=0;i<errors.length;i++) {
      errorsDiv.html(errorsDiv.html() + coinpunk.utils.stripTags(errors[i]) + '<br>');
    }
    $('#errors').removeClass('hidden');
  } else {
    $('#errors').addClass('hidden');

    this.disableSubmitButton();

    var wallet = new coinpunk.Wallet();
    var address   = wallet.createNewAddress('Default');
    var walletKey = wallet.createWalletKey(email, password);

    coinpunk.wallet = wallet;

    this.saveWallet({address: address, payload: {email: email}}, function(response) {
      if(response.result == 'ok') {
        coinpunk.wallet.sessionKey = response.sessionKey;
        coinpunk.router.listener();
        coinpunk.router.route('dashboard');
      } else if(response.result == 'exists'){
        delete coinpunk.wallet;
        errorsDiv.html('Wallet already exists, perhaps you want to <a href="#/signin">sign in</a> instead?');
        errorsDiv.removeClass('hidden');
        self.enableSubmitButton();
      } else {
        errorsDiv.html('');
        for(var i=0;i<response.messages.length;i++) {
          errorsDiv.html(errorsDiv.html() + coinpunk.utils.stripTags(response.messages[i]) + '<br>');
        }
        $('#errors').removeClass('hidden');
        self.enableSubmitButton();
      }
    });
  }
}

coinpunk.controllers.Accounts.prototype.performImport = function(id, password) {
  var button = $('#importButton');
  button.attr('disabled', 'disabled');
  var id = $('#importId').val();
  var password = $('#importPassword').val();
  var file = $('#importFile').get(0).files[0];
  var self = this;
  var reader = new FileReader();

  reader.onload = (function(walletText) {
    var wallet = new coinpunk.Wallet();
    try {
      wallet.loadPayloadWithLogin(id, password, walletText.target.result);
    } catch(e) {
      $('#importErrorDialog').removeClass('hidden');
      $('#importErrorMessage').text('Wallet import failed. Check the credentials and wallet file.');
      button.removeAttr('disabled');
      return;
    }

    if(wallet.transactions && wallet.addresses()) {
      var payload = wallet.encryptPayload();

      coinpunk.wallet = wallet;

      self.saveWallet({importAddresses: coinpunk.wallet.addressHashes()}, function(resp) {
        if(resp.result == 'exists') {
          $('#importErrorDialog').removeClass('hidden');
          $('#importErrorMessage').text('Cannot import your wallet, because the wallet already exists on this server.');
          button.removeAttr('disabled');
          return;
        } else {
          var msg = 'Wallet import successful! There will be a delay in viewing your transactions'+
                    ' until the server finishes scanning for unspent transactions on your addresses. Please be patient.';
          coinpunk.database.setSuccessMessage(msg);
          coinpunk.router.route('dashboard');
        }
      });
    } else {
      $('#importErrorDialog').removeClass('hidden');
      $('#importErrorMessage').text('Not a valid wallet backup file.');
      button.removeAttr('disabled');
    }
  });

  try {
    reader.readAsText(file);
  } catch(e) {
    $('#importErrorDialog').removeClass('hidden');
    $('#importErrorMessage').text('You must provide a wallet backup file.');
    button.removeAttr('disabled');
  }
};

coinpunk.controllers.Accounts.prototype.changeId = function() {
  var idObj = $('#changeEmailNew');
  var passwordObj = $('#changeEmailPassword');
  var id = idObj.val();
  var password = passwordObj.val();
  var self = this;

  if(/.+@.+\..+/.exec(id) === null) {
    self.changeDialog('danger', 'Email is not valid.');
    return;
  }

  var originalWalletId = coinpunk.wallet.walletId;
  var originalServerKey = coinpunk.wallet.serverKey;
  var originalPayloadHash = coinpunk.wallet.payloadHash;
  var checkWallet = new coinpunk.Wallet();
  checkWallet.createWalletKey(originalWalletId, password);

  if(checkWallet.serverKey != coinpunk.wallet.serverKey) {
    self.changeDialog('danger', 'The provided password does not match. Please try again.');
    return;
  }

  coinpunk.wallet.createWalletKey(id, password);

  var payload = {
    originalServerKey: originalServerKey,
    wallet: coinpunk.wallet.encryptPayload(),
    serverKey: coinpunk.wallet.serverKey,
    email: id,
    payloadHash: coinpunk.wallet.payloadHash
  };

  if(coinpunk.wallet.sessionKey)
    payload.sessionKey = coinpunk.wallet.sessionKey;

  $.post('api/change', payload, function(response) {
    if(response.result != 'ok')
      return self.changeDialog('danger', 'An unknown error has occured, please try again later.');

    self.template('header', 'header');
    idObj.val('');
    passwordObj.val('');
    self.changeDialog('success', 'Successfully changed email. You will need to use this to login next time, don\'t forget it!');
  });
};

coinpunk.controllers.Accounts.prototype.changePassword = function() {
  var self                  = this;
  var currentPasswordObj    = $('#currentPassword');
  var newPasswordObj        = $('#newPassword');
  var confirmNewPasswordObj = $('#confirmNewPassword');

  var currentPassword    = currentPasswordObj.val();
  var newPassword        = newPasswordObj.val();
  var confirmNewPassword = confirmNewPasswordObj.val();

  if(newPassword != confirmNewPassword) {
    this.changeDialog('danger', 'New passwords do not match.');
    return;
  }

  if(newPassword < this.requiredPasswordLength) {
    this.changeDialog('danger', 'Password must be at least '+this.requiredPasswordLength+' characters.');
    return;
  }

  var checkWallet = new coinpunk.Wallet();
  checkWallet.createWalletKey(coinpunk.wallet.walletId, currentPassword);

  if(checkWallet.serverKey != coinpunk.wallet.serverKey) {
    currentPasswordObj.val('');
    this.changeDialog('danger', 'Current password is not valid, please re-enter.');
    return;
  }

  var originalServerKey = coinpunk.wallet.serverKey;
  coinpunk.wallet.createWalletKey(coinpunk.wallet.walletId, newPassword);

  var payload = {
    originalServerKey: originalServerKey,
    wallet: coinpunk.wallet.encryptPayload(),
    serverKey: coinpunk.wallet.serverKey,
    payloadHash: coinpunk.wallet.payloadHash
  };

  if(coinpunk.wallet.sessionKey)
    payload.sessionKey = coinpunk.wallet.sessionKey;

  $.post('api/change', payload, function(response) {
    if(response.result == 'error') {
      self.changeDialog('danger', 'Error changing password');
      coinpunk.wallet.createWalletKey(coinpunk.wallet.walletId, currentPassword);
      return;
    }

    self.template('header', 'header');
    currentPasswordObj.val('');
    newPasswordObj.val('');
    confirmNewPasswordObj.val('');
    self.changeDialog('success', 'Successfully changed password. You will need to use this to login next time, don\'t forget it!');
  });
};

coinpunk.controllers.Accounts.prototype.changeDialog = function(type, message) {
  $('#changeDialog').removeClass('alert-danger');
  $('#changeDialog').removeClass('alert-success');
  $('#changeDialog').addClass('alert-'+type);
  $('#changeDialog').removeClass('hidden');
  $('#changeMessage').text(message);
};

$('body').on('click', '#generateAuthQR', function() {
  var e = $('#generateAuthQR');
  e.addClass('hidden');

  $.get('api/generateAuthKey', function(resp) {
    e.after('<div id="authQR"></div>');

    var authURI = new URI({
      protocol: 'otpauth',
      hostname: 'totp',
      path: 'Coinpunk:'+coinpunk.wallet.walletId
    });
    authURI.setSearch({issuer: 'Coinpunk', secret: resp.key});

    new QRCode(document.getElementById('authQR'), authURI.toString());
    $('#authQR').after('
      <form role="form" id="submitAuth">
        <p>Enter code shown on Google Authenticator:</p>
        <input type="hidden" id="authKeyValue" value="'+resp.key+'">
        <div class="form-group">
          <label for="confirmAuthCode">Confirm Auth Code</label>
          <input class="form-control" type="text" id="confirmAuthCode" autocorrect="off" autocomplete="off">
        </div>
        <button type="submit" class="btn btn-primary">Confirm</button>
      </form>
    ');
    $('#confirmAuthCode').focus();
  });
});

$('body').on('submit', '#submitAuth', function() {
  var e = $('#submitAuth #confirmAuthCode');
  $.post('api/setAuthKey', {serverKey: coinpunk.wallet.serverKey, sessionKey: coinpunk.wallet.sessionKey, key: $('#authKeyValue').val(), code: e.val()}, function(res) {
    if(res.set != true) {
      $('#authKey').text('Code save failed. Please reload and try again.');
    } else {
      coinpunk.usingAuthKey = true;
      $('#authKey').text('Successfully saved! You will now need your device to login.');
    }
  });
});

$('body').on('submit', '#disableAuth', function() {
  var dialog = $('#disableAuthDialog');
  dialog.addClass('hidden');
  var authCode = $('#disableAuth #disableAuthCode').val();

  $.post('api/disableAuthKey', {serverKey: coinpunk.wallet.serverKey, sessionKey: coinpunk.wallet.sessionKey, authCode: authCode}, function(resp) {
    if(resp.result == 'error') {
      dialog.text(resp.message);
      dialog.removeClass('hidden');
      return;
    }

    coinpunk.usingAuthKey = false;
    coinpunk.database.setSuccessMessage('Two factor authentication has been disabled.');
    coinpunk.router.route('dashboard', 'settings');
  });
});

coinpunk.controllers.accounts = new coinpunk.controllers.Accounts();
