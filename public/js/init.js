
require([
  "lib/jquery",
  "lib/bootstrap.min",
  "lib/ejs_production",
  "lib/underscore",
  "lib/password_strength",
  "lib/jquery.strength",
  "lib/qrcode",
], function(util) {
    //This function is called when scripts/helper/util.js is loaded.
    //If util.js calls define(), then this function is not fired until
    //util's dependencies have loaded, and the util argument will hold
    //the module value for "helper/util".
});

var Bitcoin = {};

require(["lib/bitcoinjs-lib/index"], function(require) {
  Bitcoin = require;
});

require([
    "lib/sjcl/sjcl",
    "lib/sjcl/sjcl-sha512",
    "lib/humane_dates",
    "lib/path.min",
    "coinpunk",
    "coinpunk/models/database",
    "coinpunk/models/wallet",
    "coinpunk/controller",
    "coinpunk/controllers/accounts",
    "coinpunk/controllers/dashboard",
    "coinpunk/controllers/tx",
    "coinpunk/router",
    "coinpunk/pricing"
  ], function(require) {});
