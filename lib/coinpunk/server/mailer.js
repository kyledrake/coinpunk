var ejs = require('ejs');
var nodemailer = require('nodemailer');

module.exports = {
  config: function(opts) {
    this.db = opts.db;
    this.from = opts.mailer.from;
    this.mailer = nodemailer.createTransport.apply(null, opts.mailer.transport);
    this.path = opts.path;
  },
  
  send: function(opts, callback) {
    var self = this;
    process.nextTick(function() {
      self.sendSync(opts, callback);
    });
  },

  sendSync: function(opts, callback) {
    var self = this;
    if(!this.mailer)
      return;

    this.db.getEmailWithServerKey(opts.serverKey, function(err, email) {
      if(err)
        return console.log('api/tx/send db lookup mail send error: '+email);

      ejs.renderFile(self.path+'/'+opts.template+'.ejs', {}, function(err, output) {
        if(err)
          return console.log('api/tx/send render error: '+err);

        self.mailer.sendMail({
          from: self.from,
          to: email,
          subject: opts.subject,
          text: output
        });
      });
    });
  }
};