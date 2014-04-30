var express    = require('express');
var request    = require('request');
var Insight   = require('./server/insight');
var MongoDB    = require('./server/db/mongo');
var sockjs     = require('sockjs');
var http       = require('http');
var https      = require('https');
var fs         = require('fs');
var routes     = require('./routes.js');

var Server = function (config) {
  this.config = config;
  this.insight = new Insight(config.insight);
  this.express = express();
  this.db = new MongoDB();

  // Set up the Express server.
  this.express.use(express.json());
  this.express.use(express.urlencoded());
  this.express.use(express.static('public'));
  this.express.use(function(err, req, res, next){
    console.error(err.stack);
    res.send({error: true});
  });

  // Set up our websocket.
  this.websocket = sockjs.createServer({log: function(severity, message) {
  }});

  // Export public module things.
  this.exportProperties();
};

Server.prototype.start = function () {
  var that = this;

  // Set up routes, connect databases.
  that.db.connect(that.config.mongoURL);
  routes.create(that.express, that.db, that.websocket, that.insight);

  if(that.config.httpsPort || that.config.sslKey || that.config.sslCert) {
    var httpsServer = https.createServer({
      key: fs.readFileSync(that.config.sslKey, 'utf8'),
      cert: fs.readFileSync(that.config.sslCert, 'utf8')
    }, that.express);

    that.websocket.installHandlers(httpsServer, {prefix:'/listener'});
    module.exports.httpsServer = httpsServer;

    module.exports.httpServer = http.createServer(function(req, res) {
      var host = req.headers.host;
      if(typeof host == "undefined")
        return res.end();
      res.statusCode = 302;
      var host = req.headers.host;
      var hostname = host.match(/:/g) ? host.slice(0, host.indexOf(":")) : host;
      res.setHeader('Location', 'https://'+hostname+':'+that.config.httpsPort+'/');
      res.end();
    });
  } else {
    console.log('Warning: You are not running in SSL mode!');

    var httpServer = http.createServer(that.express);
    that.websocket.installHandlers(httpServer, {prefix:'/listener'});
    module.exports.httpServer = httpServer;
  }
};

Server.prototype.exportProperties = function () {
  module.exports.config = this.config;
  module.exports.express = this.express;
}
module.exports.Server = Server;
