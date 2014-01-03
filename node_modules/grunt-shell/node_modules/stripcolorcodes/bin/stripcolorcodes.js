#!/usr/bin/env node
var stripcolorcodes = require('..'),
  fs = require('fs');

if(process.argv.length <= 2) {
  //pipe sdtin
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', function (chunk) {
    process.stdout.write(stripcolorcodes(chunk));
  });
}else{
  fs.readFile(process.argv[2], function(err, data){
    if(err) return console.error(err);
    process.stdout.write(stripcolorcodes(data.toString()));
  })
}
