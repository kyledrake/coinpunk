var assert = require('assert');
var server = require('../lib/coinpunk/server');

describe('index', function(){
  it('should serve JS app', function(done){
    server.get('/index.html')
    assert.equal('contents', done);
  })
});