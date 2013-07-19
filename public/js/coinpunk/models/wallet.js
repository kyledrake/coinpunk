coinpunk.Wallet = function(walletKey, walletId) {
  this.walletKey = walletKey;
  this.wallet = walletId;
  this.defaultIterations = 1000;
  this.serverKey = undefined;
  var keyPairs = [];

  if(walletKey && walletId)
    this.createServerKey(walletId);

  this.loadPayloadWithLogin = function(id, password, payload) {
    this.createWalletKey(id, password);
    var decrypted = JSON.parse(sjcl.decrypt(this.walletKey, payload));
    keyPairs = decrypted.keyPairs;
    return true;
  };

  this.loadPayload = function(payload) {
    var decrypted = JSON.parse(sjcl.decrypt(this.walletKey, payload));
    keyPairs = decrypted.keyPairs;
    return true;
  };

  this.createNewAddress = function(name) {
    var eckey      = new Bitcoin.ECKey();
    var newKeyPair = {
      key: eckey.getExportedPrivateKey(),
      address: eckey.getBitcoinAddress().toString()
    };

    if(name)
      newKeyPair.name = name;

    keyPairs.push(newKeyPair);
    return newKeyPair.address;
  };
  
  this.addresses = function() {
    var addrs = [];
    for(var i=0; i<keyPairs.length; i++) {
      addrs.push({address: keyPairs[i].address, name: keyPairs[i].name});
    }
    return addrs;
  };
  
  this.createServerKey = function(id) {
    this.serverKey = sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(this.walletKey, id, this.defaultIterations));
    return this.serverKey;
  };

  this.createWalletKey = function(id, password) {
    this.walletKey = sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(password, id, this.defaultIterations));
    this.serverKey = sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(this.walletKey, id, this.defaultIterations));
    return this.walletKey;
  };

  this.encryptPayload = function() {
    var payload = {keyPairs: keyPairs};
    return sjcl.encrypt(this.walletKey, JSON.stringify(payload));
  };
};