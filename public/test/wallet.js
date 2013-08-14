
describe('coinpunk.Wallet', function(){
  
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
})