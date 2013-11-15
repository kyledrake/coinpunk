var path = require('path');
var fs = require('fs');
try {
  var config = fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'config.json'));
  module.exports = JSON.parse(config);
} catch(err) {
  if(err.message.match('ENOENT') != null) {
    console.log('config.json not found, you need to create one.')
    process.exit(1);
  } else
    throw(err);
}