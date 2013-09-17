if(process.env.NODE_ENV == 'test')
  var redis = require('redis-mock');
else
  var redis = require('redis');

module.exports = redis.createClient(null, null);