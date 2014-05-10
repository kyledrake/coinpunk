var RedisItem = require("../lib/item.js"),
				should = require("should");

describe("createString", function () {
	it('should return a string when passed a string', function() {
		var elt = "foo";
		var item = RedisItem.createString(elt);

		item.type.should.equal("string");
		item.expires.should.equal(-1);
		item.value.should.equal(elt);
	});

	it('should return a number when passed a string', function() {
		var elt = 3;
		var item = RedisItem.createString(elt);

		item.type.should.equal("string");
		item.expires.should.equal(-1);
		item.value.should.equal("3");
	});


	it('should return a string when passed an object', function() {
		var elt = {foo: "bar"};
		var item = RedisItem.createString(elt);

		item.type.should.equal("string");
		item.expires.should.equal(-1);
		item.value.should.equal(JSON.stringify(elt));
	});

	it('should return a string when passed an array', function() {
		var elt = ["a", false, "b"];
		var item = RedisItem.createString(elt);

		item.type.should.equal("string");
		item.expires.should.equal(-1);
		item.value.should.equal(JSON.stringify(elt));
	});

	it('should return a string when passed a boolean', function() {
		var elt = false;
		var item = RedisItem.createString(elt);

		item.type.should.equal("string");
		item.expires.should.equal(-1);
		item.value.should.equal(elt + '');
	});

	it('should set expire when specified', function() {
		var elt = "foo";
		var item = RedisItem.createString(elt, 1000);

		item.type.should.equal("string");
		item.expires.should.equal(1000);
		item.value.should.equal(elt);
	});
});

describe("Item.createHash", function() {
	it('should create an empty hash', function() {
		var item = RedisItem.createHash();

		item.type.should.equal("hash");
		item.expires.should.equal(-1);
		item.value.should.eql({});
	});
});

describe("Item.createList", function() {
	it('should create an empty list', function() {
		var elt = "foo";
		var item = RedisItem.createList();

		item.type.should.equal("list");
		item.expires.should.equal(-1);
		item.value.should.eql([]);
		should.exist(item.lpush);
		should.exist(item.lpop);
		should.exist(item.rpush);
		should.exist(item.rpop);
	});

	it('should push at the back of the list', function() {
		var elt = "foo";
		var elt2 = true;
		var item = RedisItem.createList();

		item.type.should.equal("list");
		item.expires.should.equal(-1);
		item.rpush([elt]);
		item.rpush([elt2]);
		item.value.should.eql([elt, elt2 + '']);		
	});

	it('should push at the front of the list', function() {
		var elt = "foo";
		var elt2 = true;
		var item = RedisItem.createList();

		item.type.should.equal("list");
		item.expires.should.equal(-1);
		item.lpush([elt]);
		item.lpush([elt2]);
		item.value.should.eql([elt2 + '', elt]);		
	});

	it('should pop at the back of the list', function() {
		var item = RedisItem.createList();

		item.type.should.equal("list");
		item.expires.should.equal(-1);
		item.value = ['a','b','c'];
		item.rpop().should.eql('c');		
	});

	it('should pop at the front of the list', function() {
		var item = RedisItem.createList();

		item.type.should.equal("list");
		item.expires.should.equal(-1);
		item.value = ['a','b','c'];
		item.lpop().should.eql('a');		
	});
});