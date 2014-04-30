# Coinpunk Installation Procedure

This guide will assist you with installing Coinpunk. This document assumes you are running Mac OSX 10.9 (Maverick), adjustments may need to be made for other OSes.

If you don't understand how to use this document, **Coinpunk is not for you**. Coinpunk requires a commanding understanding of UNIX system administration to be run safely. If you are learning, you can use Coinpunk's `testnet` mode to ensure that mistakes cannot lead to loss of money.

## Install Prerequisites

Make sure that XCode and the compiler tools are installed.

Install Homebrew from `http://brew.sh` with this command (run in a terminal prompt):

```
ruby -e "$(curl -fsSL https://raw.github.com/mxcl/homebrew/go)"
```

Install some needed deps:

```
brew install wget node autoconf
```

## Install and Configure Redis

Redis is used to store your wallet data.

```
brew install redis
```

Now you will need to edit `/usr/local/etc/redis.conf` to be more data persistent:

Change `appendonly no` to `appendonly yes`.
Change `appendfsync everysec` to `appendfsync always`.

Consult `brew info redis` to learn how to configure redis to start (and start automatically on reboot).


## Install and Configure Insight API

Please check the instructions for [installing and configuring Insight API](https://github.com/bitpay/insight-api). 
In order to run Insight API you need to install bitcoind and download the bitcoin blockchain as described on the documentation.


## Install and Configure Coinpunk

Go to your user's home directory (`cd ~`), clone the repository and install nodejs dependencies:

```
git clone https://github.com/kyledrake/coinpunk.git
cd coinpunk
npm install
```

Now you will need to create and configure your config.json file, one for the main folder and one in `public`. From the `coinpunk` directory:

```
cp config.template.json config.json
```

Edit the file to connect to `bitcoind`. Use port `18332` for testnet, `8332` for production. Also remove the `testnet` entry for production:

```
{
  "insight": "http://127.0.0.1:3001/api",
  "pricesUrl": "https://bitpay.com/api/rates",
  "testnet": true,
  "httpPort": 8080
}
```

For SSL:

```
{
  "insight": "http://127.0.0.1:3001/api",
  "pricesUrl": "https://bitpay.com/api/rates",
  "testnet": true,
  "httpPort": 8085,
  "httpsPort": 8086,
  "sslKey": "./coinpunk.key",
  "sslCert": "./coinpunk.crt"
}
```

Now copy the client application's config:

```
cp public/config.template.json public/config.json
```

And change `network` to `prod` instead of `testnet` if you are using Coinpunk in production mode.

## Start Coinpunk

You can start Coinpunk from the command line:

```
node start.js -p 10000
```

Where -p is the port number you want to run Coinpunk as. It will run on port `8080` by default if -p is not provided.

Try to connect by going to http://YOURADDRESS.COM:10000. If it loads, then you should be ready to use Coinpunk!

## Backing up Database

Redis maintains a file called `/var/lib/redis/dump.rdb`, which is a backup of your Redis database. It is safe to copy this file while Redis is running. **It is strongly recommended that you backup this file frequently.** You can also setup a Redis slave to listen to master in real time. Ideally you should do both!
