coinpunk.Database = function() {
  this.coinpunkCurrencyName = 'coinpunkCurrency';
  this.storage       = localStorage;
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

coinpunk.database = new coinpunk.Database();
