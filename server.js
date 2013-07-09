var express = require('express');
var argv = require('optimist').argv;
var port = argv.p || 8080;
var app = express();

app.use(express.static('public'));

console.log("Coinpunk is running on port "+port);

app.listen(port);