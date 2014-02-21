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

  if (!addresses || !addresses.length) return callback(undefined,[]);

  var all = [];
  async.each(addresses,function(addr, a_c) {
    self.request('/addr/'+addr+'/utxo', function(err,res) {
      if (res && res.length > 0) all = all.concat(res);
      return a_c();
    });
  }, function(err) {
    return callback(undefined,all);
  });
};

Insight.prototype.request = function(path, callback) {
  var u = this.url.href  + path;

console.log('[insight.js.30]',u); //TODO
  request({uri: u, method: 'GET'}, function (error, response, body) {
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

    if(body)
      console.log('insight error '+response.statusCode+': ', body);
    else {
      console.log('insight error unknown');
    callback({message: 'Received an unrecognized error from the insight server'});
    }
  });
};

module.exports = Insight;
