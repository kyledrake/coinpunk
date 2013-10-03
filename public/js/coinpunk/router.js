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

coinpunk.router.map('#/backup/download').to(function() {
  coinpunk.router.initWallet();
  var payload = coinpunk.wallet.encryptPayload();
  var blob = new Blob([payload], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "coinpunk-wallet.txt");
  coinpunk.router.route('backup');
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
  coinpunk.router.initWallet();
  coinpunk.controllers.dashboard.index();
});

coinpunk.router.map('#/tx/details/:hash').to(function() {
  if(!coinpunk.router.requireSignin())
    return false;
  coinpunk.controllers.tx.details(this.params["hash"]);
});

coinpunk.router.map('#/tx/send').to(function() {
  if(!coinpunk.router.requireSignin())
    return false;
  coinpunk.router.initWallet();
  coinpunk.controllers.tx.send();
});

coinpunk.router.map('#/accounts/import').to(function() {
  if(coinpunk.database.loggedIn()) {
    coinpunk.router.route('dashboard');
  } else {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      coinpunk.router.render('view', 'accounts/import');
    } else {
      alert('Importing is not supported in this browser, please upgrade.');
      coinpunk.router.route('signin');
    }
  }
});

coinpunk.router.map('#/node_error').to(function() {
  coinpunk.router.render('container', 'node_error');
});

coinpunk.router.map('#/').to(function() {
/*
  if(window.navigator.registerProtocolHandler)
    window.navigator.registerProtocolHandler(
      "bitcoin",
      document.URL.substring(0,document.URL.lastIndexOf("#"))+"/?uri=%s",
      "Coinpunk"
    );
*/
  coinpunk.router.route('dashboard');
});

coinpunk.router.root("#/");
coinpunk.router.listen();