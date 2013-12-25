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

## Install and Configure Bitcoind

Currently Coinpunk depends on a custom build of Bitcoind using [this patch](https://github.com/bitcoin/bitcoin/pull/2861).

You will need the following Homebrew packages to install bitcoind (described in the bitcoind `doc/build-osx.md`, see that document for the latest bitcoind install guide):

```
brew install boost miniupnpc openssl berkeley-db4 automake pkg-config
```

Check that the openssl version is correct:

```
$ openssl version
OpenSSL 1.0.1e 11 Feb 2013
```

If it doesn't show 1.0.1 or later, it's wrong (this is wrong):

```
$ openssl version
OpenSSL 0.9.8y 5 Feb 2013
```

Try this first:

```
brew link openssl --force
```

Open a new terminal and run `openssl version` again. If it's still wrong, open `~/.bash_profile` and add this line:

```
PATH=/usr/local/bin:$PATH
```

Now you should be ready to compile and install:

``` 
wget https://github.com/sipa/bitcoin/archive/watchonly.tar.gz
tar -zxf watchonly.tar.gz
cd bitcoin-watchonly
./autogen.sh
./configure --without-qt
make
sudo make install
```

Now you need to configure bitcoind:

```
vi ~/Library/Application\ Support/Bitcoin/bitcoin.conf
```

And add the following information (set the `rpcuser` and `rpcpassword` to something else:

```
rpcuser=NEWUSERNAME
rpcpassword=NEWPASSWORD
txindex=1
testnet=1
```

**If your bitcoind crashes due to memory consumption**, try limiting your connections by adding `maxconnections=10`. Try further adjusting to 3 if you are still having issues.

If you want to run Coinpunk in production rather than on testnet, remove `testnet=1` from the config. Testnet emulates the production Bitcoin network, but does so in a way that you can't lose money. You can send money to your Coinpunk accounts using Bitcoin Testnet Faucets like [the Mojocoin Testnet3 Faucet](http://testnet.mojocoin.com/). I strongly recommend this mode for testing.

Start bitcoind:

```
bitcoind &
```

**Bitcoind will take several hours or more to download the blockchain in production.** Coinpunk will not be able to function properly until this has occurred. Please be patient.

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
  "bitcoind": "http://NEWUSERNAME:NEWPASSWORD@127.0.0.1:18332",
  "pricesUrl": "https://bitpay.com/api/rates",
  "testnet": true,
  "httpPort": 8080
}
```

For SSL:

```
{
  "bitcoind": "http://NEWUSERNAME:NEWPASSWORD@127.0.0.1:18332",
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
