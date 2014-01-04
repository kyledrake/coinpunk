var Crypto = exports.Crypto = require('./lib/crypto').Crypto;

[ 'hmac'
, 'sha1'
, 'pbkdf2'
, 'des'
, 'marc4'
, 'aes'
, 'md5'
, 'pbkdf2async'
, 'rabbit'
, 'sha256'
].forEach( function (path) {
	var module = require('./lib/' + path);
	for ( var i in module ) {
		Crypto[i] = module[i];
	}
});
