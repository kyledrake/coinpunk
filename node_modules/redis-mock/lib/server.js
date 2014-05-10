/*!
 * redis-mock
 * (c) 2012 Kristian Faeldt <kristian.faeldt@gmail.com>
 */


/**
 * flushdb
 */
exports.flushdb = flushdb = function(mockInstance, callback) {
	mockInstance.storage = {};

	mockInstance._callCallback(callback, null, 'OK');
}

/**
 * flushall
 * Exact the same as flushdb because multiple db is not supported yet
 */
exports.flushall = flushdb;
