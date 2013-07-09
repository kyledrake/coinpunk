coinpunk.controllers.accounts = {
  passwordStrength: {
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
  },

  disableSubmitButton: function() {
    var button = $('#createAccountButton');
    button.attr('disabled', 'disabled');
    button.removeClass('btn-success');
    button.text('Creating account, please wait..');
  },
  
  enableSubmitButton: function() {
    var button = $('#createAccountButton');
    button.removeAttr('disabled');
    button.addClass('btn-success');
    button.text('Create Account');
  },

  create: function() {
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
      coinpunk.wallet.storageAuth(password);

      var publicAddress      = coinpunk.wallet.createNewAddress();
      var verificationAuth   = coinpunk.wallet.verificationAuth();

      var self = this;

      $.post('/accounts/create', {
        email:                  email,
        wallet:                 coinpunk.wallet.encrypt(),
        initial_public_address: publicAddress,
        verification_key:       verificationAuth.key,
        verification_salt:      verificationAuth.salt
      }, function(response) {
        if(response.result == 'ok') {
          window.location.href = '/dashboard';
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
}