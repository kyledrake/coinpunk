coinpunk.router = Path;

coinpunk.router.render = function(id, path, data, callback) {
  coinpunk.Template.draw('header', 'header', data, callback);
  coinpunk.Template.draw(id, path, data, callback);
};

coinpunk.router.route = function(path) {
  window.location.href = '#/'+path;
};

var sock = null;

coinpunk.router.listener = function() {
  sock = new SockJS('/listener');
  var self = this;

  window.onbeforeunload = function () {
    if(sock) {
      sock.close();
    }
  }

  sock.onopen = function() {
    coinpunk.router.listenerTimeout = setInterval(function() {
      sock.send(JSON.stringify({method: 'listUnspent', addresses: coinpunk.wallet.addressHashes()}));
    }, 30000);
  };

  sock.onmessage = function(res) {
    var resData = JSON.parse(res.data);
    if(resData.method == 'listUnspent') {
      coinpunk.controllers.dashboard.mergeUnspent(resData.result, function() {
        var rt = $('#receivedTransactions');
        if(rt.length == 1)
          coinpunk.controllers.dashboard.renderDashboard();
      });
    }
  };

  sock.onclose = function() {
    clearInterval(coinpunk.router.listenerTimeout);
    if(coinpunk.database.loggedIn())
      setTimeout("coinpunk.router.listener()", 5000);
  };
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
        coinpunk.router.listener();
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
  clearInterval(coinpunk.router.listenerTimeout);
  coinpunk.controllers.dashboard.firstDashboardLoad = false;
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

coinpunk.router.map('#/account/settings').to(function() {
  if(!coinpunk.router.requireSignin())
    return false;
  coinpunk.router.initWallet();
  coinpunk.router.render('view', 'accounts/settings');
});

coinpunk.router.map('#/addresses/list').to(function() {
  if(!coinpunk.router.requireSignin())
    return false;
  coinpunk.router.initWallet();
  coinpunk.controllers.addresses.list();
});

coinpunk.router.map('#/addresses/request/:address').to(function() {
  if(!coinpunk.router.requireSignin())
    return false;
  coinpunk.router.initWallet();
  coinpunk.controllers.addresses.request(this.params['address']);
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