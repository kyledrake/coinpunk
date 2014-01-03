var Item = require("./item.js");

/**
 * Llen
 */
exports.llen = function (mockInstance, key, callback) {
  var length = mockInstance.storage[key] ? mockInstance.storage[key].value.length : 0;
  mockInstance._callCallback(callback, null, length);
};

var push = function(fn, mockInstance, key, values, callback) {
    if (mockInstance.storage[key] && mockInstance.storage[key].type !== "list") {
        return mockInstance._callCallback(callback,
              new Error("ERR Operation against a key holding the wrong kind of value"));
    }
    mockInstance.storage[key] = mockInstance.storage[key] || new Item.createList();

    fn.call(mockInstance.storage[key], values);
    var length = mockInstance.storage[key].value.length;
    pushListWatcher.pushed(key);
    mockInstance._callCallback(callback, null, length);
};

/**
 * Lpush
 */
exports.lpush = function (mockInstance, key, values, callback) {
  push(Item._list.prototype.lpush, mockInstance, key, values, callback);
};

/**
 * Rpush
 */
exports.rpush = function (mockInstance, key, values, callback) {
  push(Item._list.prototype.rpush, mockInstance, key, values, callback);
};

var pushx = function(fn, mockInstance, key, value, callback) {
  var length = 0;
  if (mockInstance.storage[key]) {
    if (mockInstance.storage[key].type !== "list") {
        return mockInstance._callCallback(callback,
              new Error("ERR Operation against a key holding the wrong kind of value"));
    }
    fn.call(mockInstance.storage[key], [value]);
    length = mockInstance.storage[key].value.length;
    pushListWatcher.pushed(key);
  }
  mockInstance._callCallback(callback, null, length);
};

/**
 * Rpushx
 */
exports.rpushx = function (mockInstance, key, value, callback) {
    pushx(Item._list.prototype.rpush, mockInstance, key, value, callback);
};

/**
 * Lpushx
 */
exports.lpushx = function (mockInstance, key, value, callback) {
    pushx(Item._list.prototype.lpush, mockInstance, key, value, callback);
};

var pop = function(fn, mockInstance, key, callback) {
  var val = null;
  if (mockInstance.storage[key] && mockInstance.storage[key].type !== "list") {
        return mockInstance._callCallback(callback,
              new Error("ERR Operation against a key holding the wrong kind of value"));
  }
  if (mockInstance.storage[key] && mockInstance.storage[key].value.length > 0) {
    val = fn.call(mockInstance.storage[key]);
  }
  mockInstance._callCallback(callback, null, val);
};

/**
 * Lpop
 */
exports.lpop = function (mockInstance, key, callback) {
  pop.call(this, Item._list.prototype.lpop, mockInstance, key, callback);
};

/**
 * Rpop
 */
exports.rpop = function (mockInstance, key, callback) {
  pop.call(this, Item._list.prototype.rpop, mockInstance, key, callback);
};

/**
 * Listen to all the list identified by keys and set a timeout if timeout != 0
 */
var listenToPushOnLists = function(mockInstance, keys, timeout, callback) {
  var listenedTo = [];
  var expire = null;
  var listener = function(key) {
    // We remove all the other listeners.
    pushListWatcher.removeListeners(listenedTo, listener);
    if (expire) {
      clearTimeout(expire);
    }
    callback(key);
  };

  for (var i = 0; i < keys.length; i++) {
    listenedTo.push(keys[i]);
    pushListWatcher.suscribe(keys[i], listener);
  }
  if (timeout > 0) {
    expire = setTimeout(function() {
      pushListWatcher.removeListeners(listenedTo, listener);
      callback(null);
    }, timeout * 1000);
  }
};

/**
 * Helper function to build blpop and brpop
 */
var bpop = function(fn, mockInstance, keys, timeout, callback) {
  var val = null;
  // Look if any element can be returned
  for (var i = 0; i < keys.length; i++) {
    if (mockInstance.storage[keys[i]] && mockInstance.storage[keys[i]].value.length > 0) {
      val = fn.call(mockInstance.storage[keys[i]]);
      mockInstance._callCallback(callback, null, val);
      return;
    }
  }
  // We listen to all the list we asked for
  listenToPushOnLists(mockInstance, keys, timeout, function(key) {
    if (key !== null) {
      val = fn.call(mockInstance.storage[key]);
      mockInstance._callCallback(callback, null, [key, val]);
    } else {
      mockInstance._callCallback(callback, null, null);
    }

  });
};

/**
 * BLpop
 */
exports.blpop = function (mockInstance, keys, timeout, callback) {
  bpop.call(this, Item._list.prototype.lpop, mockInstance, keys, timeout, callback);
};

/**
 * BRpop
 */
exports.brpop = function (mockInstance, keys, timeout, callback) {
  bpop.call(this, Item._list.prototype.rpop, mockInstance, keys, timeout, callback);
};

/**
 * Lindex
 */
exports.lindex = function (mockInstance, key, index, callback) {
  var val = null;
  if (mockInstance.storage[key]) {
    if (mockInstance.storage[key].type !== "list") {
      return mockInstance._callCallback(callback,
            new Error("ERR Operation against a key holding the wrong kind of value"));    
    }

    if (index < 0 && -mockInstance.storage[key].value.length <= index) {
      val = mockInstance.storage[key].value[mockInstance.storage[key].value.length + index];
    } else if (mockInstance.storage[key].value.length > index) {
      val = mockInstance.storage[key].value[index];
    }
  }
  mockInstance._callCallback(callback, null, val);
};

/**
 * Lset
 */
exports.lset = function (mockInstance, key, index, value, callback) {
  var res = "OK";
  var len = -1;
  if (!mockInstance.storage[key]) {
    return mockInstance._callCallback(callback,
          new Error("ERR no such key"));
  }
  if (mockInstance.storage[key].type !== "list") {
    return mockInstance._callCallback(callback,
          new Error("ERR Operation against a key holding the wrong kind of value"));    
  }
  len = mockInstance.storage[key].value.length;
  if (len <= index || -len > index) {
    return mockInstance._callCallback(callback,
          new Error("ERR index out of range"));
  }
  if (index < 0) {
    mockInstance.storage[key].value[len + index] = Item._stringify(value);
  } else {
    mockInstance.storage[key].value[index] = Item._stringify(value);
  }
  mockInstance._callCallback(callback, null, res);
};

/**
 * Used to follow a list depending on its key (used by blpop and brpop mainly)
 */
var PushListWatcher = function() {
  this.listeners = {};
};

/**
 * Watch for the next push in the list key
 */
PushListWatcher.prototype.suscribe = function(key, listener) {
  if (this.listeners[key]) {
    this.listeners[key].push(listener);
  } else {
    this.listeners[key] = [listener];
  }
};

/**
 * Calls the first listener which was waiting for an element
 * to call when we push to a list
 */
PushListWatcher.prototype.pushed = function(key) {
  if (this.listeners[key] && this.listeners[key].length > 0) {
    var listener = this.listeners[key].shift();
    listener(key);
  }
};

/**
 * Remove all the listener from all the keys it was listening to
 */
PushListWatcher.prototype.removeListeners = function(listenedTo, listener) {
  for (var i = 0; i < listenedTo.length; i++) {
    for (var j = 0; j < this.listeners[listenedTo[i]].length; j++) {
      if (this.listeners[listenedTo[i]][j] === listener) {
        this.listeners[listenedTo[i]].splice(j, 1);
        j = this.listeners[listenedTo[i]];
      }
    }
  }
};

var pushListWatcher = new PushListWatcher();
