# ![Coinpunk](http://i.imgur.com/m1diPkP.png)

Run your own Bitcoin wallet service.

Coinpunk is a web application that allows anyone to run their own self-hosted Bitcoin wallet service that is accessible from your web browser anywhere in the world. It's free, open source, and you can install it on your server right now.

## Why

Bitcoin is decentralized by nature, but having access to your bitcoins through the web is very helpful. I wanted to build something that allowed people to use bitcoin in a decentralized way, while still having the convenience of an always-on web service. Also, running the desktop client is CPU and memory intensive, and requires a constant internet connection, which a lot of people would rather not run on their personal machines.

The first major version of Coinpunk is available in the [oldschool](https://github.com/kyledrake/coinpunk/tree/oldschool) branch. It was based on Ruby and stored server keys exclusively in the bitcoind client.

The latest version is a major rewrite that uses hybrid-wallets: encryption is done in the browser via a client-side application, which can be run separately from the server. This makes it much harder for hackers to steal Bitcoins by breaking into servers.

**The newest Coinpunk is considered very alpha. DO NOT USE IT FOR SPENDING REAL BITCOINS YET. It is set to testnet by default, and is subject to major changes that may completely destroy your money. I will not provide any support for installing and using it until it hits beta. Seriously, developers and testers only.**

This project is in the early stages, but has a lot of ambition. Expect many new features and much more functionality over the course of the next few months.

## Highlights

* Fast, lightweight, efficient
* Responsive design - works well on mobile devices
* Easily create new accounts
* Send and receive bitcoins
* Detailed reports on transactions
* Ability to create and name new receive addresses ("Website Donations", "Bake Sale", etc)
* Built with Node.js and HTML5
* Standards compliant, easy to upgrade - Uses bitcoind via the JSON RPC

Coming soon:

* A ton of things
* Receiving notifications when new bitcoins arrive
* Sending bitcoins to users using e-mail (users collect the payment by getting a link to register with your service)

## Screenshots

[Click here to see screenshots gallery](https://www.dropbox.com/sh/d66dfzd5ehwae4g/leq-ca3fia)

## Get Started

See the [Install Guide](https://github.com/kyledrake/coinpunk/blob/master/docs/INSTALL.md).

## Coinpunk is for Advanced Users

If you've never worked on your own server before, and don't know how to do things like backup your database, I strongly recommend using a desktop client or hosted wallet provider like [blockchain.info](http://blockchain.info) instead. Coinpunk tries to be simple as possible, but like Gitlab, it does require some understanding of system administration to be run properly.

## Author

[Kyle Drake](http://kyledrake.net). Illustration by Kyle Wilson. A [New Brew Ventures](http://netbrewventures.com) project.

## How You Can Help

### Donations

Donations help me to keep working on Coinpunk and keep it free and open source, without having to worry about income. Any amount is really helpful! Thank you so much.

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
