coinpunk.Wallet = function() {
  var storage = {};
  var storageKey = null;
  var storageSalt = null;

  this.encrypt = function() {
    return sjcl.encrypt(storageKey, JSON.stringify(storage));
  };

  this.createNewAddress = function() {
    if(!storage.addresses)
      storage.addresses = []

    var eckey          = new Bitcoin.ECKey();
    var privateAddress = eckey.getExportedPrivateKey();
    var publicAddress  = eckey.getBitcoinAddress().toString();

    storage.addresses.push({private: privateAddress, public: publicAddress});
    return publicAddress;
  };

  this.storageAuth = function(password, salt) {
    if(!password)
      throw "Password is required"
    
    var cipher  = this._generateAuth(password, salt);
    storageKey  = cipher.key;
    storageSalt = cipher.salt;
    
    return true;
  };

  this.verificationAuth = function(salt) {
    console.log(storageKey);
    return this._generateAuth(storageKey, salt);
  };

  this._generateAuth = function(key, salt) {
    if(!salt)
      var salt = sjcl.random.randomWords(2, 0);
    else
  	  var salt = sjcl.codec.base64.toBits(salt);

    var encodedKey = sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(password, salt));
    var encodedSalt   = sjcl.codec.base64.fromBits(salt);

    return {key: encodedKey, salt: encodedSalt};
  };
  
}