/*!
 * redis-mock
 * (c) 2012 Kristian Faeldt <kristian.faeldt@gmail.com>
 */

/**
 * Module dependencies
 */
var events = require("events"),
    util = require("util");

/**
 * RedisMock constructor
 */
function RedisMock() {

    this.storage = {};

    var self = this;

    this._expireCheck = function () {

        var found = false;
        for (var s in self.storage) {

            if (self.storage[s].expires > 0) {
                self.storage[s].expires--;
                found = true;
            }
            else if (self.storage[s].expires == 0) {
                delete self.storage[s];
                found = true;
            }
        }

        if (!found) {
            self._toggleExpireCheck(false);
        }
    };

    this._toggleExpireCheck = function (toggle) {

        if (!toggle) {
            if (this._expireLoop) {
                clearInterval(this._expireLoop);
                this._expireLoop = null;
            }
        }
        else {

            if (!this._expireLoop) {
                this._expireLoop = setInterval(this._expireCheck, 1000);
            }

        }

    };

    /**
     * Helper function to launch the callback(err, reply)
     * on the next process tick
     */
    this._callCallback = function(callback, err, result) {
        if (callback) {
            process.nextTick(function () {
                callback(err, result);
            });
        }
    };
}

/**
 * RedisMock inherits from EventEmitter to be mock pub/sub
 */
util.inherits(RedisMock, events.EventEmitter);

/*
 * Create RedisMock instance and export
 */
var MockInstance = new RedisMock();
module.exports = exports = MockInstance;

/**
 * RedisClient constructor
 */
function RedisClient(stream, options) {

    var self = this;

    this.pub_sub_mode = false;

    // We always listen for 'message', even if this is not a subscription client.
    // We will only act on it, however, if the channel is in this.subscriptions, which is populated through subscribe
    this._message = function (ch, msg) {

        if (ch in self.subscriptions && self.subscriptions[ch] == true) {
            self.emit('message', ch, msg);
        }
    }

    MockInstance.on('message', this._message);

    // Pub/sub subscriptions
    this.subscriptions = [];

    process.nextTick(function () {

        self.emit("ready");
        self.emit("connect");

    });
}

/*
 * RedisClient inherits from EventEmitter
 */
util.inherits(RedisClient, events.EventEmitter);

/**
 * Export the RedisClient constructor
 */
RedisMock.prototype.RedisClient = RedisClient;

/**
 * End
 */
RedisClient.prototype.end = function () {

    var self = this;

    // Remove all subscriptions (pub/sub)
    this.subscriptions = [];

    //Remove listener from MockInstance to avoid 'too many subscribers errors'
    MockInstance.removeListener('message', this._message);

    // TODO: Anything else we need to clear?

    process.nextTick(function () {

        self.emit("end");
    });

}

/**
 * Publish / subscribe / unsubscribe
 */
var pubsub = require("./pubsub.js");
RedisClient.prototype.subscribe = pubsub.subscribe;
RedisClient.prototype.unsubscribe = pubsub.unsubscribe;
RedisClient.prototype.publish = function (channel, msg) {
    pubsub.publish.call(this, MockInstance, channel, msg);
}

/**
 * Keys function
 */

var keyfunctions = require("./keys.js");
RedisClient.prototype.del = RedisClient.prototype.DEL = function (keys, callback) {

    keyfunctions.del.call(this, MockInstance, keys, callback);
}

RedisClient.prototype.exists = RedisClient.prototype.EXISTS = function (key, callback) {

    keyfunctions.exists.call(this, MockInstance, key, callback);
}

RedisClient.prototype.expire = RedisClient.prototype.EXPIRE = function (key, seconds, callback) {

    keyfunctions.expire.call(this, MockInstance, key, seconds, callback);
}

RedisClient.prototype.keys = RedisClient.prototype.KEYS = function (pattern, callback) {

    keyfunctions.keys.call(this, MockInstance, pattern, callback);
}

/**
 * String function
 */

var stringfunctions = require("./strings.js");
RedisClient.prototype.get = RedisClient.prototype.GET = function (key, callback) {

    stringfunctions.get.call(this, MockInstance, key, callback);
}

RedisClient.prototype.set = RedisClient.prototype.SET = function (key, value, callback) {

    stringfunctions.set.call(this, MockInstance, key, value, callback);
}

/**
 * Hashing functions
 */
var hashing = require("./hash.js");
RedisClient.prototype.hget = RedisClient.prototype.HGET = function (hash, key, callback) {

    hashing.hget.call(this, MockInstance, hash, key, callback);
}
RedisClient.prototype.hexists = RedisClient.prototype.HEXISTS = function (hash, key, callback) {

    hashing.hexists.call(this, MockInstance, hash, key, callback);
}
RedisClient.prototype.hdel = RedisClient.prototype.HDEL = function (hash, key, callback) {

    hashing.hdel.call(this, MockInstance, hash, key, callback);
}
RedisClient.prototype.hset = RedisClient.prototype.HSET = function (hash, key, value, callback) {

    hashing.hset.call(this, MockInstance, hash, key, value, callback);
}
RedisClient.prototype.hincrby = RedisClient.prototype.HINCRBY = function (hash, key, increment, callback) {

    hashing.hincrby.call(this, MockInstance, hash, key, increment, callback);
}
RedisClient.prototype.hsetnx = RedisClient.prototype.HSETNX = function (hash, key, value, callback) {

    hashing.hsetnx.call(this, MockInstance, hash, key, value, callback);
}
RedisClient.prototype.hlen = RedisClient.prototype.HLEN = function (hash, callback) {

	hashing.hlen.call(this, MockInstance, hash, callback);
}

RedisClient.prototype.hkeys = RedisClient.prototype.HKEYS = function (hash, callback) {

	hashing.hkeys.call(this, MockInstance, hash, callback);
}
RedisClient.prototype.hmset = RedisClient.prototype.HMSET = function () {

	var newArguments = [MockInstance];
	for (var i = 0; i < arguments.length; i++) {
		newArguments.push(arguments[i]);
	}

	hashing.hmset.apply(this, newArguments);
}
RedisClient.prototype.hgetall = RedisClient.prototype.HGETALL = function (hash, callback) {

	hashing.hgetall.call(this, MockInstance, hash, callback);
}

/**
 * List functions
 */
var listfunctions = require("./list.js");
RedisClient.prototype.llen = RedisClient.prototype.LLEN = function(key, callback) {
  listfunctions.llen.call(this, MockInstance, key, callback);
}

var push = function(fn, key, values, callback) {
  var vals = [];
  var hasCallback = typeof(arguments[arguments.length - 1]) === "function";
  for (var i = 2; i < (hasCallback ? arguments.length - 1 : arguments.length); i++) {
    vals.push(arguments[i]);
  }
  if (hasCallback) {
    fn.call(this, MockInstance, key, vals, arguments[arguments.length - 1]);
  } else {
    fn.call(this, MockInstance, key, vals);
  }
}

RedisClient.prototype.lpush = RedisClient.prototype.LPUSH = function(key, values, callback) {
  var args = [listfunctions.lpush];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  push.apply(this, args);
}

RedisClient.prototype.rpush = RedisClient.prototype.RPUSH = function(key, values, callback) {
  var args = [listfunctions.rpush];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  push.apply(this, args);
}

RedisClient.prototype.lpushx = RedisClient.prototype.LPUSHX = function(key, value, callback) {
  listfunctions.lpushx.call(this, MockInstance, key, value, callback);
}

RedisClient.prototype.rpushx = RedisClient.prototype.RPUSHX = function(key, value, callback) {
  listfunctions.rpushx.call(this, MockInstance, key, value, callback);
}

RedisClient.prototype.lpop = RedisClient.prototype.LPOP = function(key, callback) {
  listfunctions.lpop.call(this, MockInstance, key, callback);
}

RedisClient.prototype.rpop = RedisClient.prototype.RPOP = function(key, callback) {
  listfunctions.rpop.call(this, MockInstance, key, callback);
}

var bpop = function(fn, key, timeout, callback) {
  var keys = [];
  var hasCallback = typeof(arguments[arguments.length - 1]) === "function";
  for (var i = 1; i < (hasCallback ? arguments.length - 2 : arguments.length - 1); i++) {
    keys.push(arguments[i]);
  }
  if (hasCallback) {
    fn.call(this, MockInstance, keys, arguments[arguments.length - 2], arguments[arguments.length - 1]);
  } else {
    fn.call(this, MockInstance, keys, arguments[arguments.length - 1]);
  }
}

RedisClient.prototype.blpop = RedisClient.prototype.BLPOP = function(key, timeout, callback) {
  var args = [listfunctions.blpop];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  bpop.apply(this, args);
}

RedisClient.prototype.brpop = RedisClient.prototype.BRPOP = function(key, timeout, callback) {
  var args = [listfunctions.brpop];
  for (var i = 0; i < arguments.length; i++) {
    args.push(arguments[i]);
  }
  bpop.apply(this, args);
}

RedisClient.prototype.lindex = RedisClient.prototype.LINDEX = function(key, index, callback) {
  listfunctions.lindex.call(this, MockInstance, key, index, callback);
}

RedisClient.prototype.lset = RedisClient.prototype.LSET = function(key, index, value, callback) {
  listfunctions.lset.call(this, MockInstance, key, index, value, callback);
}

/**
 * Server functions
 */
var serverfunctions = require("./server.js");
RedisClient.prototype.flushdb = RedisClient.prototype.FLUSHDB = function (callback) {

    serverfunctions.flushdb.call(this, MockInstance, callback);
}
RedisClient.prototype.flushall = RedisClient.prototype.FLUSHALL = function (callback) {

    serverfunctions.flushall.call(this, MockInstance, callback);
}

RedisMock.prototype.createClient = function (port_arg, host_arg, options) {

    return new RedisClient();
}
