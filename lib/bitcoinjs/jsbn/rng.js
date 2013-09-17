var Arcfour = require('./arcfour.js');

function Rand(opts) {
  this.opts = opts || {};
  
  if(this.runningNode()) {
    this.crypto  = require('crypto');
  }
};

Rand.prototype.initPool = function() {
  this.pool = new Array();
  this.pptr = 0;
  var t;
  
  // Pool size must be a multiple of 4 and greater than 32.
  // An array of bytes the size of the pool will be passed to Arcfour.init() for legacy browsers.
  this.poolSize = 256;

  // extract some randomness from Math.random()
  while(this.pptr < this.poolSize) {
    t = Math.floor(65536 * Math.random());
    this.pool[this.pptr++] = t >>> 8;
    this.pool[this.pptr++] = t & 255;
  }

  this.pptr = 0;
  this.seedTime();
};

// Seed the current time into the pool. Only useful for legacy browsers.
Rand.prototype.seedTime = function() {
  this.seedInt(new Date().getTime());
};

// Mix in a 32-bit integer into the pool. Walks through until it hits the end,
// Then resets back to 0 and loops (via pptr).
Rand.prototype.seedInt = function(x) {
  if(!this.pool)
    this.initPool();

  this.pool[this.pptr++] ^= x & 255;
  this.pool[this.pptr++] ^= (x >> 8) & 255;
  this.pool[this.pptr++] ^= (x >> 16) & 255;
  this.pool[this.pptr++] ^= (x >> 24) & 255;
  if(this.pptr >= this.poolSize)
    this.pptr -= this.poolSize;
};

Rand.prototype.getRandomValuesAvailable = function() {
  if(typeof(window) != 'undefined' &&
     typeof(window.crypto) != 'undefined' &&
     window.crypto.getRandomValues &&
     Uint8Array)
    return true;
  else
    return false;
};

Rand.prototype.runningNode = function() {
  // I'm not sure if this will work with browserify, but underscore uses it.
  // You could try this too: if(typeof(process) !== 'undefined' && process.title == 'node')
  if(typeof exports !== 'undefined' && this.exports !== exports)
    return true;
  else
    return false;
};

Rand.prototype.getByte = function() {
  if(this.getRandomValuesAvailable()) {
    var randomByte = new Uint8Array(1);
    window.crypto.getRandomValues(randomByte);
    return randomByte[0];
  }
  
  if(this.crypto)
    return this.crypto.randomBytes(1)[0];
  
  return this.getLegacyByte();
};

Rand.prototype.getLegacyByte = function() {
  if(!this.state) {
    this.seedTime();
    this.state = new Arcfour();
    this.state.init(this.pool);
    for(this.pptr = 0; this.pptr < this.pool.length; ++this.pptr)
      this.pool[this.pptr] = 0;
    this.pptr = 0;
  }

  // TODO: allow reseeding after first request
  return this.state.next();
};

Rand.prototype.nextBytes = function(ba) {
  var i;
  for(i = 0; i < ba.length; ++i) ba[i] = this.getByte();
};

module.exports = Rand;