var argv = require('optimist').argv;
var servers = require('./lib/coinpunk/server');

if(argv.httpPort)
  servers.config.httpPort = argv.httpPort;

if(argv.httpsPort)
  servers.config.httpsPort = argv.httpsPort;

console.log("Coinpunk and his rude boys have taken the stage");

var domain = require('domain').create();
domain.on('error', function(err) {
  console.error(err.stack);
});

domain.run(function() {
  if(servers.httpsServer)
    servers.httpsServer.listen(servers.config.httpsPort || 443);

  if(servers.httpServer)
    servers.httpServer.listen(servers.config.httpPort || argv.p || 80);
});
