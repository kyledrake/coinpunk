coinpunk.Template = {
  preCache: [
    'accounts/import',
    'accounts/settings',
    'addresses/list',
    'addresses/request',
    'dashboard/received',
    'dashboard/sent',
    'tx/details',
    'tx/send',
    'backup',
    'dashboard',
    'header',
    'node_error',
    'signin',
    'signup',
    'buy'
  ],
 
  templateCache: {},

  get: function(path, callback) {
    var self = this;

    $.get('views/'+path+'.html', function(res) {
      self.templateCache[path] = res;
      if(callback)
        callback(res);
    });
  },

  draw: function(id, path, data, callback) {
    var self = this;

    if(this.templateCache[path])
      this.parseTemplate(id, this.templateCache[path], data, callback);
    else
      this.get(path, function(res) {
        self.parseTemplate(id, res, data, callback);
      });
  },

  parseTemplate: function(id, template, data, callback) {
    $('#'+id).html(_.template(template, data, {variable: 'data'}));

    if(callback)
      callback(id);
  },

  loadPreCache: function() {
    for(var i=0; i<this.preCache.length;i++)
      this.get(this.preCache[i]);
  }
};

coinpunk.Template.loadPreCache();