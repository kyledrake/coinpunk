var redismock = require("../"),
    should = require("should");

if (process.env['VALID_TESTS']) {
    redismock = require('redis'); 
}

describe("flushdb", function () {

    it("should clean database", function(done) {

        var r = redismock.createClient();

        r.set("foo", "bar", function (err, result) {
            r.flushdb(function (err, result) {
                result.should.equal("OK");
                
                r.exists("foo", function(err, result) {

                    result.should.be.equal(0);

                    r.end();
                    done();
                })


            });

        });

    });

});

