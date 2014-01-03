redis-mock
============
The goal of the redis-mock project is to create a feature-complete mock of https://github.com/mranney/node_redis, so that it may be used interchangeably when writing unit tests for code that depends on Redis.

All operations are performed in-memory, why no Redis installation is required.

Install with:

	npm install redis-mock

## Usage

```js
var redis = require("redis-mock"),
    client = redis.createClient();
```

# API

redis-mock is a WIP, why most commands are not yet available. Currently implemented are the following:

## General

* createClient
* end

## Events

* ready
* connect
* end
* subscribe
* unsubscribe
* message

## Publish/subscribe
* publish
* subscribe
* unsubscribe

## Keys
* del
* keys
* exists
* expire

## Strings
* get
* set

## Hashing
* hset
* hsetnx
* hget
* hexists
* hdel
* hlen
* hgetall
* hmset
* hkeys
* hincrby

## Lists
* llen
* lpush
* rpush
* lpushx
* rpushx
* lpop
* rpop
* blpop
* brpop
* lindex
* lset

## Server
* flushdb
* flushall

## Cross verification

If you want to add new tests to the test base it is important that they work too on node_redis (we are creating a mock...).
You can therefore run the tests using `redis` instead of `redis-mock`. To do so:

```
	make check-tests
```

> You will need to have a running instance of redis on you machine and our tests use `flushdb a lot so make sure you don't have anything important on it.

## LICENSE - "MIT License"

Copyright (c) 2012 Kristian Faeldt <kristian.faeldt@gmail.com>

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
