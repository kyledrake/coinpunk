coinpunk.Database = function() {
  this.coinpunkCurrencyName = 'coinpunkCurrency';
  this.walletKeyName = 'coinpunkWalletKey';
  this.walletIdName  = 'coinpunkWalletId';
  this.storage       = sessionStorage;
  this.local
};

coinpunk.Database.prototype.setCurrency = function(currency) {
  return localStorage.setItem(this.coinpunkCurrencyName, currency);
};

coinpunk.Database.prototype.getCurrency = function() {
  return localStorage.getItem(this.coinpunkCurrencyName);
};

coinpunk.Database.prototype.setSuccessMessage = function(message) {
  return localStorage.setItem('successMessage', message);
};

coinpunk.Database.prototype.getSuccessMessage = function() {
  var msg = localStorage.getItem('successMessage');
  localStorage.removeItem('successMessage');
  return msg;
};

coinpunk.Database.prototype.set = function(walletKey, walletId) {
  this.storage.setItem(this.walletKeyName, walletKey);
  this.storage.setItem(this.walletIdName, walletId);
};

coinpunk.Database.prototype.reset = function() {
  this.storage.removeItem(this.walletKeyName);
  this.storage.removeItem(this.walletIdName);
  this.storage.removeItem(this.coinpunkCurrencyName);
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