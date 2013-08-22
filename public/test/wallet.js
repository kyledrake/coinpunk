
describe('coinpunk.Wallet', function(){
  
  var unspentTxs = [{
    "txid" : "54d5437ee8a55f25c88c836fbab7556f9088dbbdc4ffa4afbb7f1c4291a330ad",
    "vout" : 0,
    "scriptPubKey" : "76a914168e48aa5551a3ce7339dd55048b976edea3687288ac",
    "amount" : 0.06000000,
    "amountSatoshi" : 6000000,
    "confirmations" : 1164
  }, {
    "txid" : "54d5437ee8a55f25c88c836fbab7556f9088dbbdc4ffa4afbb7f1c4291a330ad",
    "vout" : 0,
    "scriptPubKey" : "76a914168e48aa5551a3ce7339dd55048b976edea3687288ac",
    "amount" : 0.06000000,
    "amountSatoshi" : 6000000,
    "confirmations" : 1164
  }]
  
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
    w.setUnspentTxs(unspentTxs);
    var rawTx = w.createSend('0.06', '0.0005', '134GKGyWFftj2m4ZFKsBuCbm3GgXfDmuxX');
    
  });
})