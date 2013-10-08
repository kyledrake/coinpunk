function DB() {
}

function NotImplementedError() {
  this.name = 'NotImplementedError';
  this.message = 'this function has not yet been implemented';
}

NotImplementedError.prototype = new Error();
NotImplementedError.prototype.constructor = NotImplementedError;

DB.prototype = {
  getWallet: function(serverKey, callback) {
    throw new NotImplementedError();
  },
  
  /* 
    Data requirements:
    wallet: the encrypted payload
    optional:
    email: email address for notifications
    currency: the preferred currency for exchange rates
  */
  setWallet: function(serverKey, data, callback) {
    throw new NotImplementedError();
  },
  
  deleteWallet: function(serverKey, callback) {
    throw new NotImplementedError();
  }
};

module.exports = DB;