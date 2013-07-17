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

  Path.map("#/dashboard").to(function(){
    if (coinpunk.wallet == undefined) {
      window.location.href = '#/signin';
    } else {      
      coinpunk.router.render('view', 'dashboard');
   
      $.get('/accounts/dashboard', {email: sessionStorage.getItem('email')}, function(resp) {
        console.log(resp);
      });
    }
  });

  Path.root("#/signin");
  Path.listen();
});