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
      return a_c(err);
    });
  }, function(err) {
    return callback(err,all);
  });
};

Insight.prototype.sendRawTransaction = function(rawtx, callback) {
  var self = this;
  var url = this.url.href + '/tx/send';
  if (!rawtx) return callback();
  request.post({
    headers: {'content-type' : 'application/x-www-form-urlencoded'},
    url: url,
    body: 'rawtx='+rawtx
  }, function(err,res, body) {
    if (err) return callback(err, undefined);
    if (res.statusCode != 200) return callback(body, undefined);

    return callback(undefined, body.txid);
  });
};

Insight.prototype.getTransactions = function(rawtx, callback) {
  var self = this;
  var url = this.url.href + '/tx/';

  if (!rawtx || !rawtx.length) return callback(undefined,[]);
  
  var all = [];
  async.eachSeries(rawtx,function(tx, cb) {
    request(url + tx, function(err,res, body) {
      if (!err && res.statusCode == 200) {
        all.push(JSON.parse(body));
      }
      return cb(err);
    });
  }, function(err) {
    return callback(err,all);
  });
};

Insight.prototype.request = function(path, callback) {
  var u = this.url.href  + path;

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
