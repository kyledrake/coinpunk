## NOTICE: End of work notice

Due to lack of time, support, and resources, the Coinpunk project is currently not under active development. See [the announcement](http://coinpunkblog.neocities.org).

Instead of using this code, I suggest building a new wallet based on our work improving the excellent new version of [BitcoinJS](https://github.com/bitcoinjs/bitcoinjs-lib). Coinpunk was a product of it's time, and since then many improvements to the Bitcoin code ecosystem have happened.

# ![Coinpunk](http://i.imgur.com/m1diPkP.png)

Run your own Bitcoin wallet service.

Coinpunk is a web application that allows anyone to run their own self-hosted Bitcoin wallet service that is accessible from your web browser anywhere in the world. It's free, open source, and you can install it on your server right now.

## Who uses Coinpunk

Coinpunk is aimed at developers, power users, and sysadmins interested in running their own web-based Bitcoin wallet.

Coinpunk is also used to power [coinpunk.com](https://coinpunk.com), the first fully open source web-based wallet service.

## Highlights

The latest version is a major rewrite that uses hybrid-wallets: encryption is done in the browser via a client-side application, which can be run separately from the server. This makes it much harder for hackers to steal Bitcoins by breaking into servers.

**Coinpunk is in beta. It is set to testnet by default, and it is recommended that only developers and testers only use it at this time (especially in production).**

* Fast, lightweight, efficient
* Responsive design - works well on mobile devices
* Easily create new accounts
* Send and receive bitcoins
* Detailed reports on transactions
* Ability to create and name new receive addresses ("Website Donations", "Bake Sale", etc)
* Built with Node.js and HTML5
* Standards compliant, easy to upgrade - Uses bitcoind via the JSON RPC

## Get Started

See the [Install Guide](docs/INSTALL.md), 
or the [OSX Install Guide](docs/INSTALL-OSX.md).

## Coinpunk is for Advanced Users

If you've never worked on your own server before, and don't know how to do things like backup your database, I strongly recommend using a desktop client or hosted wallet provider like [coinpunk.com](https://coinpunk.com) instead. Coinpunk tries to be simple as possible, but like Gitlab, it does require a lot of knowledge to be run properly.

## Author

[Kyle Drake](http://kyledrake.net). Illustration by Kyle Wilson.

## Contributors

[Click here](https://github.com/kyledrake/coinpunk/graphs/contributors) to see the contributor list.

## How You Can Help

### Donations

Donations help me to keep working on Coinpunk and keep it free and open source, without having to worry about income. Any amount is really helpful! Thank you so much.

The Coinpunk donation Bitcoin address is **1MHbxLgsgFQyvWkW1qiZs1HaXxU4S4LuWH**

Also if you are planning on running Coinpunk on a VPS, you can [use this link to sign up for DigitalOcean](https://www.digitalocean.com/?refcode=4be99ecc05b4) and it gives us a referral bonus we can use to pay for the servers.

Again, thank you. :heart:

### Contributing

Help us build! We're in beta right now [and seeking help to find bugs](http://coinpunk.org/beta.html). If you are interested in contributing, jump in! Anyone is welcome to send pull requests. Issue reports are good too, but pull requests are much better. Here's how you do it:

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Write the code, **and tests to confirm it works**
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin my-new-feature`)
6. Create new Pull Request

### Coinpunk H4XX0RZ Bounty

See [docs/H4XX0RZ.md](docs/H4XX0RZ.md).
