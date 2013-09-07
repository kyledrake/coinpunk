
describe('coinpunk.Wallet', function(){
  
  if(coinpunk.config.network == 'testnet') {
    var unspentTxs = [{
      "txid" : "be9030233af3367ae56096da73e6059e3dbf36f4435cc25d33a3b1ea682427c4",
      "vout" : 1,
      "scriptPubKey" : "76a914c08d3f1b8ef33cafc25b0e2bd722568e04ae572488ac",
      "amount" : 0.06000000,
      "amountSatoshiString" : 6000000,
      "confirmations" : 1164
    }, {
      "txid" : "d603cfcff274ed53bf026238cb6d6ed8112d9ee26c06f8632698c592884b60a1",
      "vout" : 0,
      "scriptPubKey" : "76a914ffc718f88bad420aa1a57633452831b269765c1688ac",
      "amount" : 0.06000000,
      "amountSatoshiString" : 6000000,
      "confirmations" : 1164
    }];

  } else {
    var unspentTxs = [{
      "txid" : "54d5437ee8a55f25c88c836fbab7556f9088dbbdc4ffa4afbb7f1c4291a330ad",
      "vout" : 0,
      "scriptPubKey" : "76a914168e48aa5551a3ce7339dd55048b976edea3687288ac",
      "amount" : 0.06000000,
      "amountSatoshiString" : 6000000,
      "confirmations" : 1164
    }, {
      "txid" : "54d5437ee8a55f25c88c836fbab7556f9088dbbdc4ffa4afbb7f1c4291a330ad",
      "vout" : 0,
      "scriptPubKey" : "76a914168e48aa5551a3ce7339dd55048b976edea3687288ac",
      "amount" : 0.06000000,
      "amountSatoshiString" : 6000000,
      "confirmations" : 1164
    }];
  }
  
  it('should create new addresses', function() {
    var wallet = new coinpunk.Wallet();
    var address = wallet.createNewAddress('Default');
    assert.equal(address, wallet.addresses()[0].address);
    assert.equal('Default', wallet.addresses()[0].name);
  })

  it('should create a wallet key from id and pass', function() {
    var id = 'test@example.com',
        pass = 'p4$$w0rdl0ll0l';

    var wallet = new coinpunk.Wallet();
    var walletKey = wallet.createWalletKey(id, pass);
    assert.equal(walletKey, sjcl.codec.base64.fromBits(sjcl.misc.pbkdf2(pass, id, wallet.defaultIterations)));
  })

  it('should create an encrypted payload and load it properly', function() {
    var id = 'test@example.com',
        pass = 'p4$$w0rdl0ll0l';

    var wallet  = new coinpunk.Wallet();
    var address = wallet.createNewAddress('Test Name');
    var walletKey = wallet.createWalletKey(id, pass);
    var payload   = wallet.encryptPayload();

    w = new coinpunk.Wallet(walletKey, id);
    w.loadPayload(payload);
    assert.equal(w.addresses()[0].address, address);
    assert.equal(w.addresses()[0].name, 'Test Name');
  })

  it('should load unspent txs', function() {
    w = new coinpunk.Wallet();
    w.setUnspentTxs(unspentTxs);
    assert.equal(w.unspentBalance(), 0.12);
  });
  
  it('should create a transaction', function() {
    w = new coinpunk.Wallet();
    var address = w.createNewAddress('Default');
    w.setUnspentTxs(unspentTxs);
    
    if(coinpunk.config.network == 'testnet')
      var addr = 'n4qP7WZjzzwE1ThuJiPB2GdzTzhr6pHcZ4';
    else
      var addr = '1MHbxLgsgFQyvWkW1qiZs1HaXxU4S4LuWH';

    var rawTx = w.createSend('0.06', '0.0005', addr);
  });
})