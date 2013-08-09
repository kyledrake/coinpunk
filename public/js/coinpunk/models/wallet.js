coinpunk.Wallet = function(walletKey, walletId) {
  this.walletKey = walletKey;
  this.walletId = walletId;
  this.defaultIterations = 1000;
  this.serverKey = undefined;
  var keyPairs = [];

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
  
  this.getAddressName = function(address) {
    for(var i=0;i<keyPairs.length;i++) {
      if(keyPairs[i].address == keyPairs[i].address) {
        return keyPairs[i].name;
      }
    }
  };
  
  this.addresses = function() {
    var addrs = [];
    for(var i=0; i<keyPairs.length; i++) {
      addrs.push({address: keyPairs[i].address, name: keyPairs[i].name});
    }
    return addrs;
  };
  
  this.addressHashes = function() {
    var addresses = this.addresses();
    var addressHashes = [];
    for(var i=0;i<addresses.length;i++)
      addressHashes.push(addresses[i].address);
    return addressHashes;
  }
  
  this.createServerKey = function() {
    this.serverKey = sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(this.walletKey, this.walletId, this.defaultIterations));
    return this.serverKey;
  };

  this.createWalletKey = function(id, password) {
    this.walletKey = sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(password, id, this.defaultIterations));
    this.walletId = id;
    this.createServerKey();
    return this.walletKey;
  };

  this.encryptPayload = function() {
    var payload = {keyPairs: keyPairs};
    return sjcl.encrypt(this.walletKey, JSON.stringify(payload));
  };
  
  this.storeCredentials = function() {
    coinpunk.database.set(this.walletKey, this.walletId);
  };
  
  if(walletKey && walletId)
    this.createServerKey();
};