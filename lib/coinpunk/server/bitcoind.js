var request = require('request');
var url     = require('url');

function Bitcoind(href, opts) {
  this.opts = opts || {};
  this.url = url.parse(href);
  if(!url.port)
    url.port = 8332;
};

Bitcoind.prototype.rpc = function(method, params, callback) {
  this.request({jsonrpc: '2.0', method: method, params: params}, callback);
};

Bitcoind.prototype.batch = function(cmds, callback) {
  var payload = [];
  for(var i=0;i<cmds.length;i++)
    payload.push({jsonrpc: '2.0', method: cmds[i].method, params: cmds[i].params, id: i});
  this.request(payload, callback);
};

Bitcoind.prototype.request = function(payload, callback) {
  request({uri: this.url.href, method: 'POST', json: payload}, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      if(body.result)
        callback(undefined, body.result);
      else
        callback(undefined, body);
    } else {
      if(response.statusCode == 401) {
        console.log('bitcoind error 401: invalid auth (check your user/pass)');
        callback({message: "Invalid auth"});
      } else {
        console.log('bitcoind error '+response.statusCode+': '+JSON.stringify(body.error));
        callback(body.error);
      }
    }
  });
};

module.exports = Bitcoind;