var Item = require("./item.js");
/*!
 * redis-mock
 * (c) 2012 Kristian Faeldt <kristian.faeldt@gmail.com>
 */

/**
 * Set
 */
exports.set = function (mockInstance, key, value, callback) {

    mockInstance.storage[key] = Item.createString(value);

    mockInstance._callCallback(callback, null, "OK");
}

/**
 * Get
 */
exports.get = function (mockInstance, key, callback) {

    var value = null;
    var err = null;

    if (mockInstance.storage[key]) {
        if (mockInstance.storage[key].type !== "string") {
            err = new Error("ERR Operation against a key holding the wrong kind of value");
        } else {
            value = mockInstance.storage[key].value;
        }
    }

    mockInstance._callCallback(callback, err, value);
}

