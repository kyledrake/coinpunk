var controller = require("./controller.js");

var UserController = function () {
  controller.Controller.apply(this, arguments);
}

// Inherit from Controller.
UserController.prototype = new controller.Controller();
UserController.prototype.constructor = UserController;

/**
 * Sets a user's password, email address, and wallet.
 */
UserController.prototype._update = function(req, res) {
  var that = this;

  if(!req.body.originalServerKey)
    return res.send({result: 'error', message: 'originalServerKey required'});

  if(!req.body.serverKey)
    return res.send({result: 'error', message: 'serverKey required'});

  if(req.body.originalServerKey == req.body.serverKey)
    return res.send({result: 'ok'});

  function sessionValidate(err, isValid) {
    if(err)
      return res.send({result: 'error', message: 'error validating record'});

    if(isValid == false)
      return res.send({result: 'error', message: 'session was invalid'});

    // Check for existing record
    that.db.getWalletRecord(req.body.serverKey, existingWalletRecord);
  };

  function existingWalletRecord(err, existingRecord) {
    if(err || existingRecord)
      return res.send({result: 'error', message: 'cannot change'});

    that.db.getWalletRecord(req.body.originalServerKey, walletRecord);
  };

  function walletRecord(err, record) {
    if(err)
      return res.send({result: 'error', message: 'error getting originalServerKey record, please try again later'});

    if(!record)
      return res.send({result: 'error', message: 'could not find originalServerKey record'});

    if(record.sessionKey && record.sessionKey != req.body.sessionKey)
      return res.send({result: 'error', message: 'invalid sessionKey'});

    var newRecord = {
      sessionKey: record.sessionKey,
      email: (req.body.email || record.email),
      payloadHash: req.body.payloadHash,
      wallet: req.body.wallet
    };

    if(record.authKey)
      newRecord.authKey = record.authKey;

    that.db.set(req.body.serverKey, newRecord, recordSaved);
  };

  function recordSaved(err, result) {
    if(err)
      return res.send({result: 'error', message: 'error changing record, please try again later'});

    that.db.delete(req.body.originalServerKey, oldRecordDeleted);
  };

  function oldRecordDeleted(err, isDeleted) {
    if(err)
      return res.send({result: 'error', message: 'error changing record, please try again later'});

    res.send({result: 'ok'});
  };

  that.db.sessionKeyValid(req.body.originalServerKey, req.body.sessionKey, sessionValidate);
}

module.exports.UserController = UserController;
