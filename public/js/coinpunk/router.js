coinpunk.router = Path;

coinpunk.router.render = function(id, path, data, callback) {
  $.get('views/header.html', function(res) {
    $('#header').html(_.template(res, data, {variable: 'data'}));
  });

  $.get('views/'+path+'.html', function(res) {
    $('#'+id).html(_.template(res, data, {variable: 'data'}));

    if(callback)
      callback(id);
  });
};

coinpunk.router.route = function(path) {
  window.location.href = '#/'+path;
};

coinpunk.router.initWallet = function() {
  if(coinpunk.wallet) {
    return coinpunk.wallet;
  } else {
    coinpunk.wallet = new coinpunk.Wallet(coinpunk.database.getWalletKey(), coinpunk.database.getWalletId());
    $.ajax({
      url: '/api/wallet',
      async: false,
      data: {serverKey: coinpunk.wallet.serverKey},
      success: function(response) {
        coinpunk.wallet.loadPayload(response.wallet);
      }
    });
  }
};

coinpunk.router.setUnspentTxs = function() {
  
};

coinpunk.router.requireSignin = function() {
  if(!coinpunk.database.loggedIn()) {
    coinpunk.router.route('signin');
    return false;
  } else {
    if(!coinpunk.wallet)
      coinpunk.router.initWallet();

    return true;
  }
};

coinpunk.router.map('#/backup').to(function() {
  coinpunk.router.initWallet();
  coinpunk.router.render('view', 'backup');
});

coinpunk.router.map("#/signup").to(function() {
  coinpunk.router.render('view', 'signup');
});

coinpunk.router.map("#/signin").to(function() {
  if(coinpunk.database.loggedIn())
    coinpunk.router.route('dashboard');
  else
    coinpunk.router.render('view', 'signin');
});

coinpunk.router.map("#/signout").to(function() {
  if(!coinpunk.router.requireSignin())
    return false;
  coinpunk.wallet = null;
  coinpunk.database.reset();
  coinpunk.router.route('signin');
});

coinpunk.router.map("#/dashboard").to(function() {
  if(!coinpunk.router.requireSignin())
    return false;
  coinpunk.router.render('view', 'dashboard');
  coinpunk.router.initWallet();
  coinpunk.controllers.dashboard.index();
});

coinpunk.router.map('#/tx/details/:txid').to(function() {
  if(!coinpunk.router.requireSignin())
    return false;
  coinpunk.controllers.tx.details(this.params["txid"]);
});

coinpunk.router.map('#/tx/send').to(function() {
  if(!coinpunk.router.requireSignin())
    return false;
  coinpunk.router.render('view', 'dashboard');
  coinpunk.router.initWallet();
  coinpunk.controllers.tx.send();
});

coinpunk.router.map('#/').to(function() {
  coinpunk.router.route('dashboard');
});

coinpunk.router.root("#/");
coinpunk.router.listen();