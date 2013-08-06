// UTF-8 encoding

var binary = require('./binary');

module.exports = {
	// Convert a string to a byte array
	stringToBytes: function (str) {
		return binary.stringToBytes(unescape(encodeURIComponent(str)));
	},

	// Convert a byte array to a string
	bytesToString: function (bytes) {
		return decodeURIComponent(escape(binary.bytesToString(bytes)));
	}

};