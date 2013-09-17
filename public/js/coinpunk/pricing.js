coinpunk.pricing = {
  cacheTimeout: 3600, // One hour in seconds
  pricesApiUrl: '/api/weighted_prices',
  defaultCurrency: 'USD',

  getLatest: function(callback) {
    var self = this;
    var currency = this.getCurrency();

    if(!self.cachedResponse ||
       !self.cachedResponseTime ||
       ((new Date().getTime()/1000) - self.cachedResponseTime) > self.cacheTimeout) {

      $.get(this.pricesApiUrl, function(response) {
        self.cachedResponse = JSON.parse(response);
        self.cachedResponseTime = (new Date().getTime()/1000);
        self.runCallback(callback);
      });
    } else {
      this.runCallback(callback);
    }
  },

  getCurrency: function() {
    return coinpunk.database.getCurrency() || this.defaultCurrency;
  },

  runCallback: function(callback) {
    var currency = this.getCurrency();
    callback(this.cachedResponse[currency]['24h'], currency);
  }
};