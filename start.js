var argv = require('optimist').argv;
var servers = require('./lib/coinpunk/server');
var config = require('./lib/coinpunk/server/config');

// Pick the config environment we're running in if
// one is specified. Otherwise, just use 'default'.
// And if there is no 'default' key, assume we're
// looking at an 'old-style' config.json and use it 
// as-is.
var env = argv.env || "default";

if(env in config)
  config = config[env];

if(argv.httpPort)
  config.httpPort = argv.httpPort;

if(argv.httpsPort)
  config.httpsPort = argv.httpsPort;

// Kick off the server!
(new servers.Server(config)).start();

console.log("Coinpunk and his rude boys have taken the stage");

var domain = require('domain').create();
domain.on('error', function(err) {
  console.error(err.stack);
});

domain.run(function() {
  if(servers.httpsServer)
    servers.httpsServer.listen(config.httpsPort || 443);

  if(servers.httpServer)
    servers.httpServer.listen(config.httpPort || argv.p || 80);
});
