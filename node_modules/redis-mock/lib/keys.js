/*!
 * redis-mock
 * (c) 2012 Kristian Faeldt <kristian.faeldt@gmail.com>
 */

/**
 * Del
 */
exports.del = function (mockInstance, keys, callback) {
    
    if (!(keys instanceof Array)) {
        keys = [keys];
    }

    var keysDeleted = 0;

    for (var i = 0; i < keys.length; i++) {
        
        if (keys[i] in mockInstance.storage) {

            delete mockInstance.storage[keys[i]];
            keysDeleted++;

        }
    }

    mockInstance._callCallback(callback, null, keysDeleted);
}

/**
 * Exists
 */
exports.exists = function (mockInstance, key, callback) {

    var result = key in mockInstance.storage ? 1 : 0;

    mockInstance._callCallback(callback, null, result);
}

/**
 * Expire
 */
exports.expire = function (mockInstance, key, seconds, callback) {

    var result = 0;

    var obj = mockInstance.storage[key];

    if (obj) {         

        mockInstance.storage[key].expires = seconds;
        result = 1;

        mockInstance._toggleExpireCheck(true);
    }

    mockInstance._callCallback(callback, null, result);
}

/* Converting pattern into regex */
function patternToRegex(pattern) {
    
    function process_plain(start, length) {
        var plain = pattern.substr(start, length);
        plain = plain.replace(/(\(|\)|\\|\.|\^|\$|\||\+)/gi
                              , function(spec) {return '\\' + spec});
        plain = plain.replace('*', '.*');
        plain = plain.replace('?', '.');
        return plain;
    }
    
    var current_position = 0;
    var parts = [];
    var group_regex = /\[([^\]]+?)\]/ig;
    
    var matches;
    while (matches = group_regex.exec(pattern)) {
        if (matches.index > 0) {
            parts.push(process_plain(current_position, matches.index - current_position));
        }
        var groups = matches[1].split('');
        for (var i in groups) {
            groups[i] = groups[i].replace(/(\(|\)|\\|\.|\^|\$|\||\?|\+|\*)/gi
            , function(spec) {return '\\' + spec});
        }
        
        var group = '(' + groups.join('|') + ')'
        parts.push(group);
        current_position = matches.index + matches[0].length;
    }
    if (current_position != pattern.length) {
        parts.push(process_plain(current_position, pattern.length - current_position));
    }
    return new RegExp(parts.join(''));
}

/**
 * Keys
 */
exports.keys = function (mockInstance, pattern, callback) {
    var regex = patternToRegex(pattern);

    var keys = [];
    for (var key in mockInstance.storage) {
        if (regex.test(key)) {
            keys.push(key);
        }
    }
    
    mockInstance._callCallback(callback, null, keys);
}
