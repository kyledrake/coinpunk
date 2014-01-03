var redismock = require("../"),
	should = require("should"),
	events = require("events");

if (process.env['VALID_TESTS']) {
    redismock = require('redis');
}

describe("basic hashing usage", function () {

    var testHash = "myHash";
    var testKey = "myKey";
    var testValue = "myValue";

    var testKeyNotExist = "myKeyNonExistant";

    it("should not say that non-existant values exist", function (done) {

        var r = redismock.createClient("", "", "");

        r.hexists(testHash, testKey, function (err, result) {

            result.should.equal(0);

            r.end();

            done();

        });

    });

    it("should set a value", function (done) {

        var r = redismock.createClient("", "", "");

        r.hset(testHash, testKey, testValue, function (err, result) {

            result.should.equal(1);

            r.end();

            done();

        });

    });

    describe("more complex set/get/exist...", function() {

        beforeEach(function(done) {
            var r = redismock.createClient("", "", "");
            r.hset(testHash, testKey, testValue, function (err, result) {

                done();

            });
        });

        it("should refuse to get a string from an hash", function(done) {

            var r = redismock.createClient("", "", "");

            r.get(testHash, function (err, result) {

                should.not.exist(result);

                err.message.should.equal("ERR Operation against a key holding the wrong kind of value");

                r.end();

                done();
            });
        });

        it("should set a value in an existing hash and say it already existed", function (done) {

            var r = redismock.createClient("", "", "");

            r.hset(testHash, testKey, testValue, function (err, result) {

                result.should.equal(0);

                r.end();

                done();

            });

        });

        it("should get a value that has been set", function (done) {

            var r = redismock.createClient("", "", "");
            
            r.hget(testHash, testKey, function (err, result) {

                result.should.equal(testValue);

                r.end();

                done();

            });

        });

        it("should not get a value that has not been set", function (done) {

            var r = redismock.createClient("", "", "");
            r.hget(testHash, testKeyNotExist, function (err, result) {

                should.not.exist(result);

                r.end();

                done();

            });

        });

        it("should say that set value exists", function (done) {

            var r = redismock.createClient("", "", "");

            r.hexists(testHash, testKey, function (err, result) {

                result.should.equal(1);

                r.end();

                done();

            });

        });

        it("should delete a value", function (done) {

            var r = redismock.createClient("", "", "");

            r.hdel(testHash, testKey, function (err, result) {

                result.should.equal(1);

                r.end();

                done();

            });

        });

        it("should not get a value that has been deleted", function (done) {

            var r = redismock.createClient("", "", "");
            r.hdel(testHash, testKey, function (err, result) {
                r.hget(testHash, testKey, function (err, result) {

                    should.not.exist(result);

                    r.end();

                    done();

                });
            });
        });

        it("should not say that deleted value exists", function (done) {

            var r = redismock.createClient("", "", "");
            r.hdel(testHash, testKey, function (err, result) {
                r.hexists(testHash, testKey, function (err, result) {

                    result.should.equal(0);

                    r.end();

                    done();

                });
            });

        });

        it("should return length 0 when key does not exist", function (done) {

            var r = redismock.createClient("", "", "");

            r.hlen("newHash", function(err, result) {

                result.should.equal(0);

                r.end();

                done();

            });
        });

        it("should return length when key exists", function (done) {

            var r = redismock.createClient("", "", "");

            r.hlen(testHash, function(err, result) {

                result.should.equal(1);

                r.hset(testHash, testKey + "2", testValue, function (err, result) {

                    r.hlen(testHash, function(err, result) {

                        result.should.equal(2);

                        r.end();

                        done();

                    });

                });
            });
        });
    });

});

describe("hincrby", function () {

    var testHash = "myHashToIncr";
    var testKey = "myKeyToIncr";


    it("should increment an attribute of the hash", function (done) {

        var r = redismock.createClient("", "", "");

        r.hincrby(testHash, testKey, 2, function (err, result) {
            result.should.equal(2);

            r.hget(testHash, testKey, function (err, result) {
                result.should.equal(2);
            });

            r.end();

            done();
        });

    });

});

describe("hsetnx", function () {

    var testHash = "myHash";
    var testKey = "myKey";
    var testKey2 = "myKey2";
    var testValue = "myValue";
    var testValue2 = "myNewTestValue";

    beforeEach(function(done) {
        var r = redismock.createClient("", "", "");
        r.hset(testHash, testKey, testValue, function (err, result) {

            done();

        });
    });

    it("should set a value that does not exist", function (done) {

        var r = redismock.createClient("", "", "");

        r.hsetnx(testHash, testKey2, testValue, function (err, result) {

            result.should.equal(1);

            r.end();

            done();

        });

    });

    it("should not set a value that does exist", function (done) {

        var r = redismock.createClient("", "", "");

        r.hsetnx(testHash, testKey, testValue2, function (err, result) {

            result.should.equal(0);

            r.hget(testHash, testKey, function (err, result) {

                result.should.not.equal(testValue2);

                result.should.equal(testValue);

                r.end();

                done();

            });

        });

    });

});

describe("multiple get/set", function() {

	var mHash = "mHash";
    var mHash2 = "mHash2";
    var mHashEmpty = "mHashEmpty";
	var mKey1 = "mKey1";
	var mKey2 = "mKey2";
	var mKey3 = "mKey3";
	var mKey4 = "mKey4";
	var mValue1 = "mValue1";
	var mValue2 = "mValue2";
	var mValue3 = "mValue3";
	var mValue4 = "mValue4";

    beforeEach(function(done) {
        var r = redismock.createClient("", "", "");
        r.hset(mHash2, mKey1, mValue1, function() {
            r.hset(mHash2, mKey2, mValue2, function() {
                r.hset(mHash2, mKey3, mValue3, function() {
                    r.hset(mHash2, mKey4, mValue4, function() {
                        done();
                    });
                });
            });
        });
    });

	// HMSET
	it("should be able to set multiple keys as multiple arguments", function(done) {

		var r = redismock.createClient("", "", "");

		r.hmset(mHash, mKey1, mValue1, mKey2, mValue2, function(err, result) {

			result.should.equal("OK");

			r.end();

			done();

		});
	});

	it("should be able to set multiple keys as an object", function(done) {


		var r = redismock.createClient("", "", "");

		r.hmset(mHash, { mKey3: mValue3, mKey4: mValue4}, function(err, result) {

			result.should.equal("OK");

			r.end();

			done();

		});

	});

	//HKEYS
	it("should be able to get all keys for hash", function(done) {

		var r = redismock.createClient("", "", "");

		r.hkeys(mHash2, function(err, result) {

			result.indexOf(mKey1).should.not.equal(-1);
			result.indexOf(mKey2).should.not.equal(-1);
			result.indexOf(mKey3).should.not.equal(-1);
			result.indexOf(mKey4).should.not.equal(-1);

			r.end();

			done();

		});

	});


	//HGETALL
	it("should be able to get all values for hash", function(done) {

		var r = redismock.createClient("", "", "");

		r.hgetall(mHash2, function(err, result) {

			should.exist(result);

			result.should.have.property(mKey1, mValue1);
			result.should.have.property(mKey2, mValue2);
			result.should.have.property(mKey3, mValue3);
			result.should.have.property(mKey4, mValue4);

			r.end();

			done();
		});
	});

  it("should return null on a non existing hash", function(done) {
    var r = redismock.createClient("","","");

    r.hgetall(mHashEmpty, function(err, result) {

      should.not.exist(result);

      r.end();

      done();
    });
  });

});
