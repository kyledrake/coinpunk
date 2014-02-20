var request = require('request');
var async = require('async');
var url     = require('url');

function Insight(href, opts) {
  this.opts = opts || {};
  this.url = url.parse(href);
  if(!url.port)
    url.port = 3000;
}

Insight.prototype.listUnspent = function(addresses, callback) {
  var self = this;

  var all = [];
  async.each(addresses,function(addr, a_c) {
    self.request('/addr/'+addr+'/unspents', function(err,res) {
      if (res.length > 0) all = all.concat(res);
      return a_c();
    });
  }, function(err) {
    return callback(undefined,all);
  });
};

Insight.prototype.request = function(path, callback) {
  request({uri: this.url.href  + path, method: 'GET'}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      var ret;
      try {
        ret = JSON.parse(body);
      } catch (e) {
        callback({message: "Wrong response from insight"});
        return;
      }
      callback(undefined, ret);   
      return;
    }

    if(error) {
      if(error.message == 'connect ECONNREFUSED') {
        console.log('insight error: connection refused');
        callback({message: "Could not connect to the insight server"});
        return;
      }

      console.log('insight error: unrecognized: '+JSON.stringify(error));
      callback({message: 'Received an unrecognized error from the insight server'});
      return;
    }

    if(response.statusCode == 401) {
      console.log('insight error 401: invalid auth (check your user/pass)');
      callback({message: "Invalid auth"});
    } else {
      if(body)
        console.log('insight error '+response.statusCode+': '+JSON.stringify(body.error));
      else
        console.log('insight error unknown');
      callback({message: 'Received an unrecognized error from the insight server'});
    }
  });
};

module.exports = Insight;
