**This module is modified from Crypto-JS: http://code.google.com/p/crypto-js/**

**Crypto-JS is a growing collection of standard and secure cryptographic algorithms implemented in JavaScript using best practices and patterns. They are fast, and they have a consistent and simple interface.**

#Quick-start Guide
## Install
<pre>
npm install ezcrypto
</pre>
## Examples
###Start
<pre>
var Crypto = require('ezcrypto').Crypto;
</pre>
###MD5
MD5 is a widely used hash function. It's been used in a variety of security applications and is also commonly used to check the integrity of files. Though, MD5 is not collision resistant, and it isn't suitable for applications like SSL certificates or digital signatures that rely on this property.

<pre>
var digest = Crypto.MD5("Message");
var digestBytes = Crypto.MD5("Message", { asBytes: true });
var digestString = Crypto.MD5("Message", { asString: true });
</pre>

###SHA-1
The SHA hash functions were designed by the National Security Agency (NSA). SHA-1 is the most established of the existing SHA hash functions, and it's used in a variety of security applications and protocols. Though, SHA-1's collision resistance has been weakening as new attacks are discovered or improved.

<pre>
var digest = Crypto.SHA1("Message");
var digestBytes = Crypto.SHA1("Message", { asBytes: true });
var digestString = Crypto.SHA1("Message", { asString: true });
</pre>

###SHA-256
SHA-256 is one of the three variants in the SHA-2 set. It isn't as widely used as SHA-1, though it appears to provide much better security.

<pre>
var digest = Crypto.SHA256("Message");
var digestBytes = Crypto.SHA256("Message", { asBytes: true });
var digestString = Crypto.SHA256("Message", { asString: true });
</pre>

###AES
The Advanced Encryption Standard (AES) is a U.S. Federal Information Processing Standard (FIPS). It was selected after a 5-year process where 15 competing designs were evaluated.

<pre>
var crypted = Crypto.AES.encrypt("Message", "Secret Passphrase");
var plain = Crypto.AES.decrypt(crypted, "Secret Passphrase");
</pre>
Thanks to contributions from Simon Greatrix and Gergely Risko, Crypto-JS now includes a variety of modes of operation as well as padding schemes.

<pre>
// CBC with default padding scheme (iso7816)
var crypted = Crypto.AES.encrypt("Message", "Secret Passphrase", { mode: new Crypto.mode.CBC });
var plain = Crypto.AES.decrypt(crypted, "Secret Passphrase", { mode: new Crypto.mode.CBC });

// CBC with ansix923 padding scheme
var crypted = Crypto.AES.encrypt("Message", "Secret Passphrase", { mode: new Crypto.mode.CBC(Crypto.pad.ansix923) });
var plain = Crypto.AES.decrypt(crypted, "Secret Passphrase", { mode: new Crypto.mode.CBC(Crypto.pad.ansix923) });
</pre>

The modes of operation currently available are:
* ECB
* CBC
* CFB
* OFB
* CTR

And the padding schemes currently available are:
* iso7816
* ansix923
* iso10126
* pkcs7
* ZeroPadding
* NoPadding

###DES
The Data Encryption Standard (DES) was selected as a U.S. Federal Information Processing Standard (FIPS) in 1976 and was widely used. Today it's considered insecure due to its small key size.

<pre>
var crypted = Crypto.DES.encrypt("Message", "Secret Passphrase");
var plain = Crypto.DES.decrypt(crypted, "Secret Passphrase");
</pre>

DES can use the same variety of modes of operation and padding schemes as AES.

Special thanks to Simon Greatrix for contributing this DES implementation.

###Rabbit
Rabbit is a high-performance stream cipher and a finalist in the eSTREAM Portfolio. It is one of the four designs selected after a 3 1/2-year process where 22 designs were evaluated.

<pre>
var crypted = Crypto.Rabbit.encrypt("Message", "Secret Passphrase");
var plain = Crypto.Rabbit.decrypt(crypted, "Secret Passphrase");
</pre>

###MARC4
MARC4 (Modified Allegedly RC4) is based on RC4, a widely-used stream cipher. RC4 is used in popular protocols such as SSL and WEP. But though it's remarkable for its simplicity and speed, it has weaknesses. Crypto-JS provides a modified version that corrects these weaknesses, but the algorithm's history still doesn't inspire confidence in its security.

<pre>
var crypted = Crypto.MARC4.encrypt("Message", "Secret Passphrase");
var plain = Crypto.MARC4.decrypt(crypted, "Secret Passphrase");
</pre>

###HMAC
Keyed-hash message authentication codes (HMAC) is a mechanism for message authentication using cryptographic hash functions. HMAC can be used in combination with any iterated cryptographic hash function.

####HMAC-MD5

<pre>
var hmac = Crypto.HMAC(Crypto.MD5, "Message", "Secret Passphrase");
var hmacBytes = Crypto.HMAC(Crypto.MD5, "Message", "Secret Passphrase", { asBytes: true });
var hmacString = Crypto.HMAC(Crypto.MD5, "Message", "Secret Passphrase", { asString: true });
</pre>

####HMAC-SHA1

<pre>
var hmac = Crypto.HMAC(Crypto.SHA1, "Message", "Secret Passphrase");
var hmacBytes = Crypto.HMAC(Crypto.SHA1, "Message", "Secret Passphrase", { asBytes: true });
var hmacString = Crypto.HMAC(Crypto.SHA1, "Message", "Secret Passphrase", { asString: true });
</pre>

####HMAC-SHA256

<pre>
var hmac = Crypto.HMAC(Crypto.SHA256, "Message", "Secret Passphrase");
var hmacBytes = Crypto.HMAC(Crypto.SHA256, "Message", "Secret Passphrase", { asBytes: true });
var hmacString = Crypto.HMAC(Crypto.SHA256, "Message", "Secret Passphrase", { asString: true });
</pre>

###PBKDF2
PBKDF2 is a password-based key derivation function. In many applications of cryptography, user security is ultimately dependent on a password, and because a password usually can't be used directly as a cryptographic key, some processing is required.

A salt provides a large set of keys for any given password, and an iteration count increases the cost of producing keys from a password, thereby also increasing the difficulty of attack.

<pre>
var salt = Crypto.util.randomBytes(16);

var key128bit = Crypto.PBKDF2("Secret Passphrase", salt, 16);
var key256bit = Crypto.PBKDF2("Secret Passphrase", salt, 32);
var key512bit = Crypto.PBKDF2("Secret Passphrase", salt, 64);

var key512bit1000 = Crypto.PBKDF2("Secret Passphrase", salt, 64, { iterations: 1000 });
</pre>

PBKDF2 with a large iteration count can take a long time to compute. To avoid long-running script warnings, and thanks to contributions from Don Park, Crypto-JS provides an alternative version that executes asyncronously and passes the result to a callback. You also have the option to specify an onProgressChange callback that allows you to keep the user updated.

<pre>
var salt = Crypto.util.randomBytes(16);

function onCompleteHandler(result) {
	    document.getElementById('result').innerHTML = result;
}

function onProgressChangeHandler(percent) {
	    document.getElementById('progress').innerHTML = percent + '%';
}

Crypto.PBKDF2Async("Secret Passphrase", salt, 64, onCompleteHandler, { iterations: 1000, onProgressChange: onProgressChangeHandler });
</pre>

###Utilities
<pre>
var helloBytes = Crypto.charenc.Binary.stringToBytes("Hello, World!");
var helloString = Crypto.charenc.Binary.bytesToString(helloBytes);

var utf8Bytes = Crypto.charenc.UTF8.stringToBytes("България");
var unicodeString = Crypto.charenc.UTF8.bytesToString(utf8Bytes);

var helloHex = Crypto.util.bytesToHex(helloBytes);
var helloBytes = Crypto.util.hexToBytes(helloHex);

var helloBase64 = Crypto.util.bytesToBase64(helloBytes);
var helloBytes = Crypto.util.base64ToBytes(helloBase64);
</pre>
