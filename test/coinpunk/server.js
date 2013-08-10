var assert = require('assert');
var server = require('../../lib/coinpunk/server');
var request = require('supertest');

describe('GET /', function(){
  it('responds with Coinpunk app', function(done){
    request(server)
      .get('/')
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect(200)
      .expect(/Coinpunk/, done);
  })
});