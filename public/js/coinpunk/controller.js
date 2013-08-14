coinpunk.Controller = function() {
};

coinpunk.Controller.prototype.template = function(id, path, data, callback) {
  $.get('views/'+path+'.html', function(res) {
    $('#'+id).html(_.template(res, data, {variable: 'data'}));
    
    if(callback)
      callback(id);
  });
};

coinpunk.Controller.prototype.friendlyTimeString = function(timestamp) {
  var date = new Date(timestamp*1000);
  return date.toLocaleString();
};

coinpunk.Controller.prototype.minimumSendConfirmations = 1;
coinpunk.Controller.prototype.minimumStrongSendConfirmations = 6;

coinpunk.controllers = {};