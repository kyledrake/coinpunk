coinpunk.Template = {
  templateCache: {},

  draw: function(id, path, data, callback) {
    var self = this;

    if(this.templateCache[path])
      this._parseTemplate(id, this.templateCache[path], data, callback);
    else  
      $.get('views/'+path+'.html', function(res) {
        self.templateCache[path] = res;
        self._parseTemplate(id, res, data, callback);
      });
  },
  
  _parseTemplate: function(id, template, data, callback) {
    $('#'+id).html(_.template(template, data, {variable: 'data'}));

    if(callback)
      callback(id);
  }
};
