var argv = require('optimist').argv;
var port = argv.p || 8080;
var server = require('./lib/coinpunk/server');

console.log("Coinpunk and his rude boys have taken the stage on port "+port);

var domain = require('domain').create();
domain.on('error', function(err) {
  console.error(err.stack);
});

domain.run(function() {
  server.listen(port);
});