# Installation requirements

This document describes the OS/hardware requirements for using Coinpunk.

## Operating System

### Linux

Coinpunk is developed for the Linux operating system, and it is the recommended OS to use. We are using Ubuntu 12.10 for testing, which is our recommended platform.

### FreeBSD/NetBSD/OpenBSD/Solaris/OSX

Other Unix operating systems (*BSD, OSX) should be supported, but have not yet been tested. If you try and succeed, please update this document to inform other users of your success and document any changes they need to make.

### Windows

Windows support is theoretically possible. We will be attempting to build a windows port eventually, but for now this is untested.

## Ruby Versions

Coinpunk requires Ruby 1.9.3 or later. Rubinius in 1.9 mode has not yet been tested, and may require a few changes to work.

## JRuby

JRuby is now supported! Make sure you are using version 1.7 or later. You will need to set the `config.yml` to use the jdbc drivers:

* For PostgreSQL: `jdbc:postgresql://postgres@localhost/coinbase`
* For MySQL: `jdbc:mysql://root@localhost/coinbase`
* For SQLite: `jdbc:sqlite://coinbase.sqlite3`

## Hardware Requirements

### CPU

Coinpunk itself is actually very lightweight, so the CPU activity is principally for the bitcoind server. I have had no issues running bitcoind on low-resource VPS servers, even cheap single-core ones. Obviously, the faster the CPU, the more performance you will see.

### Memory

Coinpunk uses a "low" amount of memory (~70MB on 64-bit machines). However, bitcoind does require a bit of memory, especially when first getting started. We recommend at least 512MB.

Bitcoind 0.8.2 is supposed to have much lower memory requirements, which will hopefully improve this problem. In the interim, if you need to run bitcoind on a lower memory instance (or are having issues with bitcoind crashing due to lack of memory) you can help to reduce memory usage by reducing the number of connections it makes to other bitcoin servers. Try adding this to your `bitcoin.conf` file:

    maxconnections=3

You can experiment with raising/lowering this, but keep in mind that lowering it will slow down your ability to keep up with the Bitcoin network.

### Storage

As of this writing, the full copy of the Bitcoin blocks can take up to 9GB of disk space, and this is certainly rising. We recommend having at least 20GB of storage available, but obviously more is better.

You can check how much space is being used with the `du` command in Linux. For example, if your `du -h .bitcoin`

### Virtual Private Server (VPS)

My recommendation for running Coinpunk is to throw it on a hosted VPS. DigitalOcean has affordable VPS plans that I've had good experience with. If you decide to use DigitalOcean, [please sign up using this link](https://www.digitalocean.com/?refcode=4be99ecc05b4), which gives us a referral credit we can use to help pay for the Coinpunk development servers. Thank you!

## Improving documentation

If you get Coinpunk to run on another OS, or run into specific issues you found solutions for, please contribute your installation documentation by forking this repository and sending a pull request! It will help other users to run Coinpunk.
