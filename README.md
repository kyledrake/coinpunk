# ![Coinpunk](http://i.imgur.com/rR6TV8C.png)

[![](https://secure.travis-ci.org/kyledrake/coinpunk.png)](http://travis-ci.org/kyledrake/coinpunk)

Run your own Bitcoin wallet service.

Coinpunk is a web application that allows anyone to run their own self-hosted Bitcoin wallet service that is accessible from your web browser anywhere in the world. It's free, open source, and you can install it on your server right now.

## Why

Bitcoin is decentralized by nature, but having access to your bitcoins through the web is very helpful. I wanted to build something that allowed people to use bitcoin in a decentralized way, while still having the convenience of an always-on web service. Also, running the desktop client is CPU and memory intensive, and requires a constant internet connection, which a lot of people would rather not run on their personal machines.

This project is in the early stages, but has a lot of ambition. Expect many new features and much more functionality over the course of the next several months.

## Highlights

* Fast, lightweight, threaded, efficient
* Responsive design - works well on mobile devices
* Easily create new accounts
* Send and receive bitcoins
* Detailed reports on transactions
* Ability to create and name new receive addresses ("Website Donations", "Bake Sale", etc)
* Built with Ruby and Sinatra, easy to modify and improve
* Standards compliant, easy to upgrade - Uses bitcoind via the JSON RPC to do all the heavy lifting
* Will never sell out to a record label

Coming soon:

* Receiving notifications when new bitcoins arrive.
* Sending bitcoins to users using e-mail (users collect the payment by getting a link to register with your service).
* Signing with a record label (oops)

## Screenshots

[Click here to see screenshots gallery](https://www.dropbox.com/sh/d66dfzd5ehwae4g/leq-ca3fia)

## Get Started

Installation is relatively simple (and will get simpler in the future). See the [`Installing on Ubuntu`](./docs/install-ubuntu.md) guide to get started.

*If you are using Coinpunk master, you should run 'git checkout 0.0.3' to lock the version, and prevent breakage when we refactor our code to improve security and performance.*

## Coinpunk is for Advanced Users

If you've never worked on your own server before, and know how to do things like backup your wallet file, I strongly recommend using a desktop client or hosted wallet provider like [blockchain.info](http://blockchain.info) instead. Coinpunk tries to be simple as possible, but like Gitlab, it does require some understanding of system administration to be run properly.

## Author

[Kyle Drake](http://kyledrake.net). Illustration by Kyle Wilson. A [New Brew Ventures](http://netbrewventures.com) project.

## How You Can Help

### Donations

My summer plan is to work full-time on Coinpunk, which is awesome, but unfortunately it doesn't pay the rent (lousy punk!). Donations help me to keep working on it and keep it free and open source, without having to worry about income. Any amount is really helpful! Thank you so much.

The Coinpunk donation Bitcoin address is **1MHbxLgsgFQyvWkW1qiZs1HaXxU4S4LuWH**

Also if you are planning on running Coinpunk on a VPS, you can [use this link to sign up for DigitalOcean](https://www.digitalocean.com/?refcode=4be99ecc05b4) and it gives us a referral bonus we can use to pay for the servers.

Again, thank you. :heart:

### Contributing

Help us build! We're in a really early stage right now, so there is a lot of rapid planning going on. If you are interested in becoming part of the development team, let me know.

Anyone is welcome to send pull requests! Here's how you do it:

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Write the code, **and tests to confirm it works**
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin my-new-feature`)
6. Create new Pull Request
