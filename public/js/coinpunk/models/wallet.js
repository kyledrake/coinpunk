coinpunk.Wallet = function(walletKey, walletId) {
  this.network = coinpunk.config.network || 'prod';
  this.walletKey = walletKey;
  this.walletId = walletId;
  this.defaultIterations = 1000;
  this.serverKey = undefined;
  this.transactions = [];
  this.unspent = [];
  this.minimumConfirmations = 1;
  this.unspentConfirmations = [];
  var keyPairs = [];

  this.loadPayloadWithLogin = function(id, password, payload) {
    this.createWalletKey(id, password);
    this.loadPayload(payload);
    return true;
  };

  this.loadPayload = function(encryptedJSON) {
    var payloadJSON = sjcl.decrypt(this.walletKey, encryptedJSON);
    this.payloadHash = this.computePayloadHash(payloadJSON);
    var payload = JSON.parse(payloadJSON);
    keyPairs = payload.keyPairs;
    this.transactions = payload.transactions || [];
    this.unspent = payload.unspent || [];
    return true;
  };

  this.mergePayload = function(wallet) {
    var payloadJSON = sjcl.decrypt(this.walletKey, wallet);
    var payload = JSON.parse(payloadJSON);

    keyPairs = _.uniq(_.union(payload.keyPairs, keyPairs), false, function(item, key, a) {
      return item.key;
    });

    this.transactions = _.uniq(_.union(payload.transactions, this.transactions), false, function(item, key, a) {
      return item.hash;
    });

    this.unspent = _.uniq(_.union(payload.unspent, this.unspent), false, function(item, key, a) {
      return item.hash;
    });

    this.payloadHash  = this.computePayloadHash(payloadJSON);

    return true;
  };

  this.createNewAddress = function(name, isChange) {
    var eckey      = new Bitcoin.ECKey();
    var newKeyPair = {
      key: eckey.getExportedPrivateKey(this.network),
      publicKey: Bitcoin.convert.bytesToHex(eckey.getPubKeyHash()),
      address: eckey.getBitcoinAddress(this.network).toString(),
      isChange: (isChange == true)
    };

    if(name)
      newKeyPair.name = name;

    keyPairs.push(newKeyPair);
    return newKeyPair.address;
  };
  
  this.removeAddress = function(address) {
    var i=0;
    for(i=0;i<keyPairs.length;i++)
      if(keyPairs[i].address == address)
        keyPairs.splice(i, 1)
  };

  this.getAddressName = function(address) {
    for(var i=0;i<keyPairs.length;i++)
      if(keyPairs[i].address == address)
        return keyPairs[i].name;
  };

  this.addresses = function() {
    var addrs = [];
    for(var i=0; i<keyPairs.length; i++) {
      addrs.push({address: keyPairs[i].address, name: keyPairs[i].name, isChange: keyPairs[i].isChange});
    }
    return addrs;
  };

  this.receiveAddresses = function() {
    var addrs = [];
    for(var i=0; i<keyPairs.length; i++) {
      if(keyPairs[i].isChange != true)
        addrs.push({address: keyPairs[i].address, name: keyPairs[i].name});
    }
    return addrs;
  };

  this.receiveAddressHashes = function() {
    var addrHashes = [];
    for(var i=0; i<keyPairs.length; i++) {
      if(keyPairs[i].isChange != true)
        addrHashes.push(keyPairs[i].address);
    }

    return addrHashes;
  };

  this.changeAddressHashes = function() {
    var addrHashes = [];
    for(var i=0; i<keyPairs.length; i++) {
      if(keyPairs[i].isChange == true)
        addrHashes.push(keyPairs[i].address);
    }

    return addrHashes;
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

  this.computePayloadHash = function(payloadJSON) {
    return sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(payloadJSON));
  };

  this.encryptPayload = function() {
    var payload = {keyPairs: keyPairs, transactions: this.transactions, unspent: this.unspent};
    var payloadJSON = JSON.stringify(payload);
    this.newPayloadHash = this.computePayloadHash(payloadJSON);
    return sjcl.encrypt(this.walletKey, payloadJSON);
  };

  this.mergeUnspent = function(newUnspent) {
    var changed = false;
    this.unspentConfirmations = this.unspentConfirmations || {};

    for(var i=0;i<newUnspent.length;i++) {
      var match = false;

      for(var j=0;j<this.unspent.length;j++) {
        if(this.unspent[j].hash == newUnspent[i].hash)
          match = true;
      }

      this.unspentConfirmations[newUnspent[i].hash] = newUnspent[i].confirmations;

      if(match == true)
        continue;

      changed = true;

      this.unspent.push({
        hash: newUnspent[i].hash,
        vout: newUnspent[i].vout,
        address: newUnspent[i].address,
        scriptPubKey: newUnspent[i].scriptPubKey,
        amount: newUnspent[i].amount
      });

      // todo: time should probably not be generated here

      var txMatch = false;

      for(var k=0;k<this.transactions.length;k++) {
        if(this.transactions[k].hash == newUnspent[i].hash)
          txMatch = true;
      }

      if(txMatch == false) {
        this.transactions.push({
          hash: newUnspent[i].hash,
          type: 'receive',
          address: newUnspent[i].address,
          amount: newUnspent[i].amount,
          time: new Date().getTime()
        });
      }
    }

    return changed;
  };

  this.getUnspent = function(confirmations) {
    var confirmations = confirmations || 0;
    var unspent = [];

    for(var i=0; i<this.unspent.length; i++)
      if(this.unspentConfirmations[this.unspent[i].hash] >= confirmations)
        unspent.push(this.unspent[i]);
    return unspent;
  };

  this.pendingUnspentBalance = function() {
    var unspent = this.getUnspent(0);
    var changeAddresses = this.changeAddressHashes();
    var balance = new BigNumber(0);

    for(var u=0;u<unspent.length;u++) {
      if(this.unspentConfirmations[unspent[u].hash] == 0 && _.contains(changeAddresses, unspent[u].address) == false)
        balance = balance.plus(unspent[u].amount);
    }
    return balance;
  };

  this.safeUnspentBalance = function() {
    var safeUnspent = this.safeUnspent();
    var amount = new BigNumber(0);
    for(var i=0;i<safeUnspent.length;i++)
      amount = amount.plus(safeUnspent[i].amount);
    return amount;
  };

  // Safe to spend unspent txs.
  this.safeUnspent = function() {
    var unspent = this.getUnspent();
    var changeAddresses = this.changeAddressHashes();
    var safeUnspent = [];
    for(var u=0;u<unspent.length;u++) {
      if(_.contains(changeAddresses, unspent[u].address) == true || this.unspentConfirmations[unspent[u].hash] >= this.minimumConfirmations)
        safeUnspent.push(unspent[u]);
    }

    return safeUnspent;
  };

  this.receivedAmountTotal = function() {
    var addresses = this.addresses();
    var amount = new BigNumber(0);

    for(var a=0;a<addresses.length;a++)
      amount = amount.plus(this.addressReceivedAmount(addresses[a]));

    return amount;
  }

  this.addressReceivedAmount = function(address) {
    var amount = new BigNumber(0.00);

    for(var t=0; t<this.transactions.length;t++)
      if(this.transactions[t].address == address)
        amount = amount.plus(this.transactions[t].amount);

    return amount;
  };

  this.createTx = function(amtString, feeString, addressString, changeAddress) {
    var amt = Bitcoin.util.parseValue(amtString);

    if(amt == Bitcoin.BigInteger.ZERO)
      throw "spend amount must be greater than zero";

    if(!changeAddress)
      throw "change address was not provided";

    var fee = Bitcoin.util.parseValue(feeString || '0');
    var total = Bitcoin.BigInteger.ZERO.add(amt).add(fee);

    var address = new Bitcoin.Address(addressString, this.network);
    var sendTx = new Bitcoin.Transaction();
    var i;

    var unspent = [];
    var unspentAmt = Bitcoin.BigInteger.ZERO;

    var safeUnspent = this.safeUnspent();

    for(i=0;i<safeUnspent.length;i++) {
      unspent.push(safeUnspent[i]);

      var amountSatoshiString = new BigNumber(safeUnspent[i].amount).times(Math.pow(10,8)).toString();

      unspentAmt = unspentAmt.add(new Bitcoin.BigInteger(amountSatoshiString));

      // If > -1, we have enough to send the requested amount
      if(unspentAmt.compareTo(total) > -1) {
        break;
      }
    }

    if(unspentAmt.compareTo(total) < 0) {
      throw "you do not have enough bitcoins to send this amount";
    }

    for(i=0;i<unspent.length;i++) {
      sendTx.addInput({hash: unspent[i].hash}, unspent[i].vout);
    }

    // The address you are sending to, and the amount:
    sendTx.addOutput(address, amt);

    var remainder = unspentAmt.subtract(total);

    if(!remainder.equals(Bitcoin.BigInteger.ZERO)) {
      sendTx.addOutput(changeAddress, remainder);
    }

    var hashType = 1; // SIGHASH_ALL

    // Here will be the beginning of your signing for loop

    for(i=0;i<unspent.length;i++) {
      var unspentOutScript = new Bitcoin.Script(Bitcoin.convert.hexToBytes(unspent[i].scriptPubKey));
      var hash = sendTx.hashTransactionForSignature(unspentOutScript, i, hashType);
      var pubKeyHash = unspentOutScript.simpleOutHash();
      var pubKeyHashHex = Bitcoin.convert.bytesToHex(pubKeyHash);

      for(var j=0;j<keyPairs.length;j++) {
        if(_.isEqual(keyPairs[j].publicKey, pubKeyHashHex)) {
          var key = new Bitcoin.Key(keyPairs[j].key);
          var signature = key.sign(hash);
          signature.push(parseInt(hashType, 10));

          sendTx.ins[i].script = Bitcoin.Script.createInputScript(signature, key.getPub());
          break;
        }
      }
    }

    return {unspentsUsed: unspent, obj: sendTx, raw: Bitcoin.convert.bytesToHex(sendTx.serialize())};
  };

  this.calculateFee = function(amtString, addressString, changeAddress) {
    var tx = this.createTx(amtString, 0, addressString, changeAddress);
    var txSize = tx.raw.length / 2;
    // console.log(txSize);
    return Math.ceil(txSize/1000)*0.0001;
  };

  this.createSend = function(amtString, feeString, addressString, tx) {
    this.transactions.push({
      hash: Bitcoin.convert.bytesToHex(tx.obj.getHash()),
      type: 'send',
      address: addressString,
      amount: amtString,
      fee: feeString,
      time: new Date().getTime()
    });

    // Remove unspent elements now that we have a tx that uses them
    for(var i=0;i<tx.unspentsUsed.length;i++)
      this.unspent = _.reject(this.unspentsUsed, function(u) { return u.hash == tx.unspentsUsed[i].hash })

  };

  if(walletKey && walletId)
    this.createServerKey();
};
