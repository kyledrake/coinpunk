/*!
 * Crypto-JS v2.0.0
 * http://code.google.com/p/crypto-js/
 * Copyright (c) 2009, Jeff Mott. All rights reserved.
 * http://code.google.com/p/crypto-js/wiki/License
 */

var charenc = require('./charenc');

// Crypto utilities
module.exports.util = {
	// Generate an array of any length of random bytes
	randomBytes: function (n) {
		for (var bytes = []; n > 0; n--)
			bytes.push(Math.floor(Math.random() * 256));
		return bytes;
	}
};

// Crypto mode namespace
module.exports.mode = {};

module.exports.UTF8 = charenc.UTF8;
module.exports.Binary = charenc.Binary;

module.exports.charenc = charenc;
module.exports.SHA256 = require('./sha256');
module.exports.RIPEMD160 = require('./ripemd160');