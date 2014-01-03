var redismock = require("../"),
	should = require("should"),
	events = require("events");

if (process.env['VALID_TESTS']) {
    redismock = require('redis'); 
}

describe("del", function () {

    it("should do nothing with non-existant keys", function (done) {

        var r = redismock.createClient("", "", "");

        r.del(["key1", "key2", "key3"], function (err, result) {

            result.should.equal(0);

            r.del("key4", function (err, result) {

                result.should.equal(0);

                r.end();

                done();

            });            

        });

    });

    it("should delete existing keys", function (done) {

        var r = redismock.createClient("", "", "");

        r.set("test", "test", function (err, result) {

            r.del("test", function (err, result) {

                result.should.equal(1);

                r.get("test", function (err, result) {

                    should.not.exist(result);

                    r.end();

                    done();

                });                

            });

        });

    });

    it("should delete multiple keys", function (done) {

        var r = redismock.createClient("", "", "");

        r.set("test", "val", function (err, result) {

            r.set("test2", "val2", function (err, result) {

                r.del(["test", "test2", "noexistant"], function (err, result) {

                    result.should.equal(2);

                    r.end();

                    done();

                });

            });

        });

    });

});

describe("exists", function () {

    it("should return 0 for non-existing keys", function(done) {

        var r = redismock.createClient("", "", "");

        r.exists("test", function (err, result) {

            result.should.equal(0);

            r.end();

            done();

        });
    });

    it("should return 1 for existing keys", function (done) {

        var r = redismock.createClient("", "", "");

        r.set("test", "test", function (err, result) {

            r.exists("test", function (err, result) {

                result.should.equal(1);

                r.del("test");

                r.end();

                done();

            });

        });

    });

});

//TODO: test that keys persist over rename
//TODO: test that expire can update
//TODO: test persist
//TODO: test that expire clears when setting different value to key
describe("expire", function () {    

    it("should return 0 for non-existing key", function (done) {

        var r = redismock.createClient("", "", "");

        r.expire("test", 10, function (err, result) {

            result.should.equal(0);

            r.end();

            done();

        });

    });

    it("should return 1 when timeout set on existing key", function (done) {

        var r = redismock.createClient("", "", "");

        r.set("test", "test", function (err, result) {

            r.expire("test", 10, function (err, result) {

                result.should.equal(1);

                r.del("test");

                r.end();

                done();

            });

        });

    });

    it("should make key disappear after the set time", function (done) {

        var r = redismock.createClient("", "", "");

        r.set("test", "val", function (err, result) {

            r.expire("test", 1, function (err, result) {

                result.should.equal(1);

                setTimeout(function () {
                    console.log("Waiting for expire...");
                }, 1000);

                setTimeout(function () {

                    r.exists("test", function (err, result) {

                        result.should.equal(0);

                        r.end();

                        done();

                    });                    

                }, 2100);

            });

        });

    });

});

describe("keys", function () {

    var r = redismock.createClient();
    beforeEach(function(done) {
        r.set("hello", "test", function() {
            r.set("hallo", "test", function() {
                r.set("hxlo", "test", done);
            });
        });

    });

    it ("should return all existing keys if pattern equal - *", function (done) {
        r.keys('*', function (err, keys) {
            keys.should.have.length(3);
            keys.should.include("hello");
            keys.should.include("hallo");
            keys.should.include("hxlo");
            done();
        });
    });

    it ("should correct process pattern with '?'", function (done) {
        r.keys('h?llo', function (err, keys) {
            keys.should.have.length(2);
            keys.should.include("hello");
            keys.should.include("hallo");
            done();
        });
    });

    it ("should correct process pattern with character sets", function (done) {
        r.keys('h[ae]llo', function (err, keys) {
            keys.should.have.length(2);
            keys.should.include("hello");
            keys.should.include("hallo");
            done();
        });
    });

    it ("should correct process pattern with all special characters", function (done) {
        r.keys('?[aex]*o', function (err, keys) {
            keys.should.have.length(3);
            keys.should.include("hello");
            keys.should.include("hallo");
            keys.should.include("hxlo");
            done();
        });
    });
});