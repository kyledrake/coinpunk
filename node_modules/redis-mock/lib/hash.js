/*!
 * redis-mock
 * (c) 2012 Kristian Faeldt <kristian.faeldt@gmail.com>
 */

/**
 * Module dependencies
 */
var Item = require("./item.js");

/**
 * Hget
 */
exports.hget = function (mockInstance, hash, key, callback) {

	var value = null;
	var err = null;

	if (mockInstance.storage[hash]) {
		if (mockInstance.storage[hash].type === "hash") {
			value = mockInstance.storage[hash].value[key];
		} else {
			err = new Error("ERR Operation against a key holding the wrong kind of value");
		}
	}

	mockInstance._callCallback(callback, err, value);
}

/**
 * Hexists
 */
exports.hexists = function (mockInstance, hash, key, callback) {

	var b = 0;
	var err = null;

	if (mockInstance.storage[hash]) {
		if (mockInstance.storage[hash].type === "hash") {
			b = mockInstance.storage[hash].value[key] ? 1 : 0;
		} else {
			err = new Error("ERR Operation against a key holding the wrong kind of value");
		}
	}

    mockInstance._callCallback(callback, err, b);
}

/**
 * Hdel
 */
exports.hdel = function (mockInstance, hash, key, callback) {

    var nb = 0;

    //TODO: Support multiple values as key
	if (mockInstance.storage[hash]) {
		if (mockInstance.storage[hash].type === "hash") {
			if (mockInstance.storage[hash].value[key]) {
				delete mockInstance.storage[hash].value[key];
				nb++;
			}
		} else {
			err = new Error("ERR Operation against a key holding the wrong kind of value");
		}
	}

    mockInstance._callCallback(callback, null, nb);
}

/*
 * Hset
 */
exports.hset = function (mockInstance, hash, key, value, callback) {
    var update = false;

	if (mockInstance.storage[hash]) {
		if (mockInstance.storage[hash].type !== "hash") {
			return mockInstance._callCallback(callback,
						new Error("ERR Operation against a key holding the wrong kind of value"));
		}
		if (mockInstance.storage[hash].value[key]) {
			update = true;
		}
	} else {
		mockInstance.storage[hash] = Item.createHash();
	}

    mockInstance.storage[hash].value[key] = value;

    mockInstance._callCallback(callback, null, update ? 0 : 1);
};

/**
 * Hsetnx
 */
exports.hsetnx = function (mockInstance, hash, key, value, callback) {
    if (!mockInstance.storage[hash]
			|| mockInstance.storage[hash].type !== "hash"
			|| !mockInstance.storage[hash].value[key]) {
        exports.hset(mockInstance, hash, key, value, callback);
    } else {
        mockInstance._callCallback(callback, null, 0);
    }

};

/**
 * Hincrby
 */
exports.hincrby = function (mockInstance, hash, key, increment, callback) {

    if (mockInstance.storage[hash]) {
		if (mockInstance.storage[hash].type !== "hash") {
			return mockInstance._callCallback(callback,
						new Error("ERR Operation against a key holding the wrong kind of value"));
		}
    } else {
		mockInstance.storage[hash] = Item.createHash();
    }

    if (mockInstance.storage[hash].value[key] && !/^\d+$/.test(mockInstance.storage[hash].value[key])) {
		return mockInstance._callCallback(callback,
						new Error("ERR hash value is not an integer"));
    }

    mockInstance.storage[hash].value[key] = mockInstance.storage[hash].value[key] || 0;

    mockInstance.storage[hash].value[key] += increment;

    mockInstance._callCallback(callback, null, mockInstance.storage[hash].value[key]);
};

/**
 * Hgetall
 */
exports.hgetall = function(mockInstance, hash, callback) {

	// TODO: Confirm if this should return null or empty obj when key does not exist
	var obj = {};
	var nb = 0;

    if (mockInstance.storage[hash] && mockInstance.storage[hash].type !== "hash") {
		return mockInstance._callCallback(callback,
					new Error("ERR Operation against a key holding the wrong kind of value"));
    }
    if (mockInstance.storage[hash]) {
		for (var k in mockInstance.storage[hash].value) {
			nb++;
			obj[k] = mockInstance.storage[hash].value[k];
		}
	}

	mockInstance._callCallback(callback, null, nb === 0 ? null : obj);
}

/**
 * Hkeys
 */
exports.hkeys = function(mockInstance, hash, callback) {

	var list = [];

    if (mockInstance.storage[hash] && mockInstance.storage[hash].type !== "hash") {
		return mockInstance._callCallback(callback,
					new Error("ERR Operation against a key holding the wrong kind of value"));
    }
    if (mockInstance.storage[hash]) {
		for (var k in mockInstance.storage[hash].value) {
			list.push(k);
		}
	}

	mockInstance._callCallback(callback, null, list);
}

/**
 * Hmset
 */
exports.hmset = function(mockInstance) {

	// We require at least 3 arguments
	// 0: mockInstance
	// 1: hash name
	// 2: key/value object or first key name
	if (arguments.length <= 3) {
		return;
	}

	var keyValuesToAdd = {};

	if ('object' == typeof arguments[2]) {

		keyValuesToAdd = arguments[2];

	} else {

		for (var i = 2; i < arguments.length; i += 2) {

			// Array big enough to have both a key and value
			if (arguments.length > (i+1)) {
				var newKey = arguments[i];
				var newValue = arguments[i+1];

				// Neither key nor value is a callback
				if ('function' !== typeof newKey && 'function' !== typeof newValue) {

					keyValuesToAdd[newKey] = newValue;

				} else {
					break;
				}
			} else {
				break;
			}
		}
	}

	var hash = arguments[1];

	if (mockInstance.storage[hash]) {
		if (mockInstance.storage[hash].type !== "hash") {
			return mockInstance._callCallback(callback,
					new Error("ERR Operation against a key holding the wrong kind of value"));
		}
	} else {
		mockInstance.storage[hash] = new Item.createHash();
	}

	for (var k in keyValuesToAdd) {
		mockInstance.storage[hash].value[k] = keyValuesToAdd[k];
	}

	// Do we have a callback?
	if ('function' === typeof arguments[arguments.length-1]) {
		mockInstance._callCallback(arguments[arguments.length-1], null, "OK");
	}
}

/**
 * Hlen
 */
exports.hlen = function (mockInstance, hash, callback) {

	if (!mockInstance.storage[hash]) {
		return mockInstance._callCallback(callback, null, 0);
	}
	if (mockInstance.storage[hash].type !== "hash") {
		return mockInstance._callCallback(callback,
				new Error("ERR Operation against a key holding the wrong kind of value"));
	}
	var cnt = 0;
	for (var p in mockInstance.storage[hash].value) {
		if (mockInstance.storage[hash].value.hasOwnProperty(p)) {
			cnt++;
		}
	}

	mockInstance._callCallback(callback, null, cnt);
}
