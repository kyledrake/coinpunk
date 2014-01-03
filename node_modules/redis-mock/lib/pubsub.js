/*!
 * redis-mock
 * (c) 2012 Kristian Faeldt <kristian.faeldt@gmail.com>
 */

/**
 * Subscribe
 *
 * TODO: Verify how multiple channel subscription works in actual Redis
 * 	 Optional callback?
 *
 */
exports.subscribe = function () {
    
    var self = this;

    if (!arguments.length) {
        return;
    }

    this.pub_sub_mode = true;

    for (var i = 0; i < arguments.length; i++) {

        if ('string' == typeof arguments[i]) {

            // Event on next tick to emulate an actual server call
            var channelName = arguments[i];
            process.nextTick(function () {
                self.subscriptions[channelName] = true;
                // TODO Should also send length of subscriptions here
                self.emit('subscribe', channelName);
            });
        }
    }    
}

/**
 * Unsubscribe
 */
exports.unsubscribe = function () {

    var self = this;

    // TODO: Unsubscribe from ALL channels
    if (!arguments.length) {
        this.pub_sub_mode = false;
        return;
    }

    for (var i = 0; i < arguments.length; i++) {

        if ('string' == typeof arguments[i]) {

            // Event on next tick to emulate an actual server call	
            var channelName = arguments[i];
            process.nextTick(function () {
                self.subscriptions[channelName] = false;
                delete self.subscriptions[channelName];
                self.emit('unsubscribe', channelName);
            });
        }
    }

    // TODO: If this was the last subscription, pub_sub_mode should be set to false

}

/**
 * Publish
 */
exports.publish = function (mockInstance, channel, msg) {

    this.pub_sub_mode = true;
    process.nextTick(function () {
        mockInstance.emit('message', channel, msg);
    });
}
