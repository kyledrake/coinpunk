coinpunk.Wallet = function(payload, password, passwordSalt) {
  var self      = this;
  self.storage  = {};

  if(payload && password && passwordSalt) {
    var passHashObj = self.hash(password, passwordSalt);

    self.passwordHash = passHashObj.key;
    self.passwordSalt = passHashObj.salt;

    self.storage = sjcl.decrypt(passHashObj.key, payload);
  }
};

coinpunk.Wallet.prototype.createNewAddress = function() {
  var self = this;

  if(!self.storage.addresses)
    self.storage.addresses = [];

  var eckey   = new Bitcoin.ECKey();
  var privKey = eckey.getExportedPrivateKey();
  var btcAddr = eckey.getBitcoinAddress().toString();

  self.storage.addresses.push({key: privKey, address: btcAddr});

  return btcAddr;
};

coinpunk.Wallet.prototype.encrypt = function(password) {
  var self = this;

  return sjcl.encrypt(password, JSON.stringify(storage));
};

coinpunk.Wallet.prototype.hash = function(key, salt) {
  var self = this;

  if(!salt)
    var salt = sjcl.random.randomWords(2, 0);
  else
	  var salt = sjcl.codec.base64.toBits(salt);

  var encodedKey = sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(password, salt));
  var encodedSalt   = sjcl.codec.base64.fromBits(salt);

  return {key: encodedKey, salt: encodedSalt};
};

