coinpunk.Controller = function() {
};

coinpunk.Controller.prototype.ejs = function(path, data) {
  return new EJS({url: 'views/'+path}).render(data);
};

coinpunk.Controller.prototype.friendlyTimeString = function(timestamp) {
  var date = new Date(timestamp*1000);
  return date.toLocaleString();
};

coinpunk.Controller.prototype.minimumSendConfirmations = 1;
coinpunk.Controller.prototype.minimumStrongSendConfirmations = 6;

coinpunk.controllers = {};