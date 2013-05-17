# ![Coinpunk](http://i.imgur.com/rR6TV8C.png)

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

## Author

[Kyle Drake](http://kyledrake.net). Illustration by Kyle Wilson.

I will be at Bitcoin 2013, and will be introducing this project at the hackathon. I'd love to hear your thoughts/feedback! I'll be wearing a bright orange shirt so it will be easy for people to find me.

## Contributing

1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
