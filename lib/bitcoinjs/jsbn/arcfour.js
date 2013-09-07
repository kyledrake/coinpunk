function Arcfour() {
  this.i = 0;
  this.j = 0;
  this.S = new Array();
};

// Initialize arcfour context from key, an array of ints, each from [0..255]
Arcfour.prototype.init = function(key) {
  var i, j, t;
  
  if(key.length != 256)
    throw 'key must be a 256 length array of ints';
    
  var zeroArray = true;
  for(i=0; i<key.length; i++) {
    if(key[i] !== 0) {
      zeroArray = false;
      break;
    }
  }

  if(zeroArray)
    throw "key cannot be an array of zeroes"

  for(i = 0; i < 256; ++i)
    this.S[i] = i;
  j = 0;
  for(i = 0; i < 256; ++i) {
    j = (j + this.S[i] + key[i % key.length]) & 255;
    t = this.S[i];
    this.S[i] = this.S[j];
    this.S[j] = t;
  }
  this.i = 0;
  this.j = 0;
};

Arcfour.prototype.next = function() {
  var t;
  this.i = (this.i + 1) & 255;
  this.j = (this.j + this.S[this.i]) & 255;
  t = this.S[this.i];
  this.S[this.i] = this.S[this.j];
  this.S[this.j] = t;
  return this.S[(t + this.S[this.i]) & 255];
};