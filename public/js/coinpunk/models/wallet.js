coinpunk.Wallet = function(walletKey, walletId) {
  this.network = coinpunk.config.network || 'prod';
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

  this.createNewAddress = function(name, isChange) {
    var eckey      = new Bitcoin.ECKey();
    var newKeyPair = {
      key: eckey.getExportedPrivateKey(this.network),
      publicKey: Bitcoin.convert.bytesToHex(eckey.getPubKeyHash()),
      address: eckey.getBitcoinAddress(this.network).toString(),
      isChange: (isChange || false)
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
      addrs.push({address: keyPairs[i].address, name: keyPairs[i].name, isChange: keyPairs[i].isChange});
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

  this.setUnspentTxs = function(unspentTxs) {
    this.unspentTxs = unspentTxs;
  };

  this.unspentBalance = function() {
    var amount = 0;
    for(var i=0; i<this.unspentTxs.length; i++)
      amount = amount + this.unspentTxs[i].amount;
    return amount;
  };

  this.createSend = function(amtString, feeString, address, changeAddress) {
    var amt = Bitcoin.util.parseValue(amtString);
    
    if(amt == Bitcoin.BigInteger.ZERO)
      throw "spend amount must be greater than zero";
    
    var fee = Bitcoin.util.parseValue(feeString || '0');
    var total = Bitcoin.BigInteger.ZERO.add(amt).add(fee);
    
    var address = new Bitcoin.Address(address, this.network);
    var sendTx = new Bitcoin.Transaction();
    var i;

    var unspentTxs = [];
    var unspentTxsAmt = Bitcoin.BigInteger.ZERO;

    for(i=0;i<this.unspentTxs.length;i++) {
      unspentTxs.push(this.unspentTxs[i]);
      unspentTxsAmt = unspentTxsAmt.add(new Bitcoin.BigInteger(this.unspentTxs[i].amountSatoshiString));
      
      // If > -1, we have enough to send the requested amount
      if(unspentTxsAmt.compareTo(total) > -1) {
        break;
      }
    }

    if(unspentTxsAmt.compareTo(total) < 0) {
      throw "you do not have enough bitcoins to send this amount";
    }
    
    for(i=0;i<unspentTxs.length;i++) {
      sendTx.addInput({hash: unspentTxs[i].txid}, unspentTxs[i].vout);
    }
    
    // The address you are sending to, and the amount:
    sendTx.addOutput(address, amt);
    
    var remainder = unspentTxsAmt.subtract(total);
    
    if(!remainder.equals(Bitcoin.BigInteger.ZERO)) {
      sendTx.addOutput(this.addresses()[0].address, remainder);
    }
    
    return;
    var hashType = 1; // SIGHASH_ALL
    
    // Here will be the beginning of your signing for loop

    for(i=0;i<unspentTxs.length;i++) {
      var unspentOutScript = new Bitcoin.Script(Bitcoin.convert.hexToBytes(unspentTxs[i].scriptPubKey));
      var hash = sendTx.hashTransactionForSignature(unspentOutScript, i, hashType);
      var pubKeyHash = unspentOutScript.simpleOutHash();

      // todo refactor wallet to save public keys in keyPair, this is expensive

      for(var j=0;j<keyPairs.length;j++) {
        var key = new Bitcoin.Key(keyPairs[j].key);

        if(_.isEqual(key.getPubKeyHash(), pubKeyHash)) {
          var signature = key.sign(hash);
          signature.push(parseInt(hashType, 10));

          sendTx.ins[i].script = Bitcoin.Script.createInputScript(signature, key.getPub());
          break;
        }
      }
    }

    var raw = Bitcoin.convert.bytesToHex(sendTx.serialize());
    return raw;
  };

  if(walletKey && walletId)
    this.createServerKey();
};