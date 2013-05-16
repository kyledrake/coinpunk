# ![Coinpunk](http://i.imgur.com/rR6TV8C.png)

Want to run your own web-based wallet service for you and your friends? Now you can!

Coinpunk allows anyone to run their own hosted Bitcoin wallet service, which is accessible from the web. Coinpunk runs on your own server.

## Why

There are a lot of centralized, hosted wallet services out there. After talking with a lot of people, I realized that there are a lot of people that will never use these services because they are concerned about potential issues (sudden fee hikes, theft, uninsured bank-like activities).

Coinpunk is a service you run on your own VPS or local machine, so it has none of these problems.

## Highlights

* Fast, lightweight, threaded, efficient
* Easily create new accounts
* Send and receive Bitcoins
* Detailed reports on transactions
* Ability to create and name new receive addresses
* Built with Ruby and Sinatra, easy to modify and improve
* Uses bitcoind via the JSON RPC, which makes it robust and easy to upgrade when the official protocol changes

Coming soon:

* Receiving notifications when new bitcoins arrive.
* Send Bitcoins to users using e-mail (users collect the payment by getting a link to register with your service).

## Screenshots

[Click Here](https://www.dropbox.com/sh/d66dfzd5ehwae4g/leq-ca3fia).

## Get Started

Installation is relatively simple (and will get simpler in the future). See the [`Installing on Ubuntu 12.10`](./install-ubuntu.md) guide to get started.

## Author

[Kyle Drake](http://kyledrake.net)

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request