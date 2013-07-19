coinpunk.Database = function() {
  this.walletKeyName = 'coinpunkWalletKey';
  this.walletIdName  = 'coinpunkWalletId';
  this.storage       = sessionStorage;
};

coinpunk.Database.prototype.set = function(walletKey, walletId) {
  this.storage.setItem(this.walletKeyName, walletKey);
  this.storage.setItem(this.walletIdName, walletId);
};

coinpunk.Database.prototype.reset = function() {
  this.storage.removeItem(this.walletKeyName);
  this.storage.removeItem(this.walletIdName);
};

coinpunk.Database.prototype.loggedIn = function() {
  if(this.getWalletKey() && this.getWalletId())
    return true;
  else
    return false;
};

coinpunk.Database.prototype.getWalletKey = function() {
  return this.storage.getItem(this.walletKeyName);
};

coinpunk.Database.prototype.getWalletId = function() {
  return this.storage.getItem(this.walletIdName);
};

coinpunk.database = new coinpunk.Database();