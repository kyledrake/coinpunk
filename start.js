var argv = require('optimist').argv;
var port = argv.p || 8080;
var server = require('./lib/coinpunk/server');

console.log("Coinpunk and his rude boys have taken the stage on port "+port);

server.listen(port);