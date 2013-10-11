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
        if(response.error)
          return;
        self.cachedResponse = response;
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
    
    for(var i=0; i<this.cachedResponse.length; i++)
      if(this.cachedResponse[i].code == this.defaultCurrency)
        var rate = parseFloat(this.cachedResponse[i].rate).toFixed(2);

    callback(rate, currency);
  }
};