
describe('coinpunk.Wallet', function(){
  
  if(coinpunk.config.network == 'testnet') {
    var unspentTxs = [{ 
      hash: '712affd6fb3178517593f825178caa2d544230cdfe330046b54121845ed55581',
      vout: 0,
      address: 'mpYTFdkR8ZDVDYo8XCSQZL92hiMD1UVncy',
      scriptPubKey: '76a9146301b89ec725adf0a04c37152edfcf188a1dd18d88ac',
      amount: 0.06,
      confirmations: 5
    }, {
      hash: 'f1f320c172e37b4e79cee3830ba9aa18a4fc513fa57d675abed46107798b88c8',
      vout: 1,
      address: 'mpYTFdkR8ZDVDYo8XCSQZL92hiMD1UVncy',
      scriptPubKey: '76a9146301b89ec725adf0a04c37152edfcf188a1dd18d88ac',
      amount: 0.06,
      confirmations: 10
    }];
  } else {
    var unspentTxs = [{
      "hash" : "54d5437ee8a55f25c88c836fbab7556f9088dbbdc4ffa4afbb7f1c4291a330ad",
      "vout" : 0,
      "scriptPubKey" : "76a914168e48aa5551a3ce7339dd55048b976edea3687288ac",
      "amount" : 0.06
    }, {
      "hash" : "54d5437ee8a55f25c88c836fbab7556f9088dbbdc4ffa4afbb7f1c4291a330ad",
      "vout" : 0,
      "scriptPubKey" : "76a914168e48aa5551a3ce7339dd55048b976edea3687288ac",
      "amount" : 0.06
    }];
  }
  
  it('should create new addresses', function() {
    var wallet = new coinpunk.Wallet();
    var address = wallet.createNewAddress('Default');
    assert.equal(address, wallet.addresses()[0].address);
    assert.equal('Default', wallet.addresses()[0].name);
    assert.equal(Bitcoin.Address.validate(address, (coinpunk.config.network)), true);
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

  it('should load safe unspent txs', function() {
    w = new coinpunk.Wallet();
    w.mergeUnspent(unspentTxs);
    assert.equal(w.safeUnspentBalance().toString(), new BigNumber('0.12'));
    assert.equal(w.pendingUnspentBalance().toString(), new BigNumber('0'));

    for(var i=0;i<w.unspent.length;i++)
      w.unspentConfirmations[w.unspent.hash] = 0;

    assert.equal(w.pendingUnspentBalance().toString(), '0');
  });

  it('should create a transaction', function() {
    w = new coinpunk.Wallet();
    var address = w.createNewAddress('Default');
    w.mergeUnspent(unspentTxs);

    if(coinpunk.config.network == 'testnet')
      var addr = 'mhLhpH7216Gz5xbogtgtB3MgCMu3NWUx8w';
    else
      var addr = '1MHbxLgsgFQyvWkW1qiZs1HaXxU4S4LuWH';

    var rawTx = w.createSend('0.06', '0.0005', addr, address);
  });
})