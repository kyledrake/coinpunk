coinpunk.router = {
  render: function(id, name, stateObj) {
    $('#header').html(new EJS({url: 'views/header.ejs'}).render());
    $('#'+id).html(new EJS({url: 'views/'+name+'.ejs'}).render());
    return false;
  }
};

$(document).ready(function() {
  Path.map("#/signup").to(function() {
    coinpunk.router.render('view', 'signup');
  });

  Path.map("#/signin").to(function() {
    if (coinpunk.wallet != undefined) {
      window.location.href = '#/dashboard';
    } else {
      coinpunk.router.render('view', 'signin');
    }
  });
  
  Path.map("#/signout").to(function() {
    coinpunk.wallet = null;
    sessionStorage.removeItem('walletKey');
    sessionStorage.removeItem('walletId');
    
    window.location.href = '#/signin';
  });

  Path.map("#/dashboard").to(function(){
    if (!sessionStorage.getItem('walletKey')) {
      window.location.href = '#/signin';
    } else {      
      coinpunk.router.render('view', 'dashboard');

      if(!coinpunk.wallet) {
        coinpunk.wallet = new coinpunk.Wallet(sessionStorage.getItem('walletKey'));
        var serverKey = coinpunk.wallet.createServerKey(sessionStorage.getItem('walletId'));

        $.get('/wallet', {serverKey: serverKey}, function(response) {
          coinpunk.wallet.loadPayload(response.wallet);
          coinpunk.controllers.dashboard.loadDashboard();
        });
      } else {
        coinpunk.controllers.dashboard.loadDashboard();
      }
    }
  });

  if(sessionStorage.getItem('walletKey')) {
    window.location.href = '#/dashboard';
  } else {
    Path.root("#/signin");
  }

  Path.listen();
});