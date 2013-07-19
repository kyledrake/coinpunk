
coinpunk.Controller = function() {
};

coinpunk.Controller.prototype.ejs = function(path, data) {
  return new EJS({url: 'views/'+path}).render(data);
};

coinpunk.controllers = {};