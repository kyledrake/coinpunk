# Coinpunk Installation Procedure

This guide will assist you with installing Coinpunk. This document assumes you are running Ubuntu 12.04 LTS, adjustments may need to be made for other OSes.

If you don't understand how to use this document, **Coinpunk is not for you**. Coinpunk requires a commanding understanding of UNIX system administration to be run safely. If you are learning, you can use Coinpunk's `testnet` mode to ensure that mistakes cannot lead to loss of money.

## System Requirements

A VPS with at least 2GB RAM is needed for the moment, due to the memory usage of bitcoind. This will hopefully be lowered in the future (either from bitcoind becoming more memory efficient, or from Coinpunk switching to a lighter SPV-based node).

## Install Prerequisites

Update your repository data and packages if this is a fresh install of Ubuntu:

```
sudo apt-get update
sudo apt-get upgrade
sudo apt-get install git autoconf libtool ntp build-essential
```

It is recommended you enable [unattended security updates](https://help.ubuntu.com/community/AutomaticSecurityUpdates) to help protect your system from security issues:

```
sudo apt-get install unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

## Install NodeJS

The latest information on installing NodeJS for your platform is [available here](https://github.com/joyent/node/wiki/Installing-Node.js-via-package-manager), this is the current procedure for Ubuntu:

```
sudo apt-get install python-software-properties python g++ make
sudo add-apt-repository ppa:chris-lea/node.js
sudo apt-get update
sudo apt-get install nodejs
```

## Install and Configure Redis

Redis is used to store your wallet data.

```
sudo apt-get install redis-server
```

Now you will need to edit `/etc/redis/redis.conf` to be more data persistent:

Change `appendonly no` to `appendonly yes`.
Change `appendfsync everysec` to `appendfsync always`.

Restart redis: `sudo service redis-server restart`.

## Install and Configure Bitcoind

Currently Coinpunk depends on a custom build of Bitcoind using [this patch](https://github.com/bitcoin/bitcoin/pull/2861).

```
wget https://github.com/sipa/bitcoin/archive/watchonly.tar.gz
tar -zxf watchonly.tar.gz
cd bitcoin-watchonly
sudo add-apt-repository ppa:bitcoin/bitcoin
sudo apt-get update
sudo apt-get install libdb4.8++ libdb4.8++-dev pkg-config libprotobuf-dev libminiupnpc8 minissdpd libboost-all-dev ccache libssl-dev
./autogen.sh
./configure --without-qt
make
sudo make install
```

If you see this error when running configure: `configure: error: Could not find a version of the library!`
Try running with this command instead: `./configure --with-boost-libdir=/usr/lib/x86_64-linux-gnu --without-qt`

Now you need to configure bitcoind:

```
mkdir -p ~/.bitcoin
vi ~/.bitcoin/bitcoin.conf
```

And add the following information (set the `rpcuser` and `rpcpassword` to something else:

```
rpcuser=NEWUSERNAME
rpcpassword=NEWPASSWORD
txindex=1
testnet=1
```

**If your bitcoind crashes due to memory consumption**, try limiting your connections by adding `maxconnections=10`. Try further adjusting to 3 if you are still having issues.

If you want to run Coinpunk in production rather than on testnet, remove `testnet=1` from the config. Testnet emulates the production Bitcoin network, but does so in a way that you can't lose money. You can send money to your Coinpunk accounts using Bitcoin Testnet Faucets like [the Mojocoin Testnet3 Faucet](http://faucet.xeno-genesis.com/). I strongly recommend this mode for testing.

Start bitcoind:

```
bitcoind &
```

**Bitcoind will take several hours or more to download the blockchain.** Coinpunk will not be able to function properly until this has occurred. Please be patient.

If you want something to monitor bitcoind to ensure it stays running and start it on system restart, take a look at [Monit](http://mmonit.com/monit/).

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
node start.js
```


Try to connect by going to http://YOURADDRESS.COM:8080  (If you're using the SSL config then try  http://YOURADDRESS.COM:8085. OR https://YOURADDRESS.COM:8086) If it loads, then you should be ready to use Coinpunk!

## Backing up Database

Redis maintains a file called `/var/lib/redis/dump.rdb`, which is a backup of your Redis database. It is safe to copy this file while Redis is running. **It is strongly recommended that you backup this file frequently.** You can also setup a Redis slave to listen to master in real time. Ideally you should do both!

## Extra Steps for Contributors

If you want to contribute code to this project, you will need to use Grunt. Grunt is a task-runner that presently handles minifying and uglifying Coinpunk's CSS and JS resources.  Grunt is installed by the `npm install` you ran from the coinpunk directory.

Running `./node_modules/grunt-cli/bin/grunt` in your Coinpunk directory will minify and uglify everything, and running `./node_modules/grunt-cli/bin/grunt watch` will automatically uglify your JS files when they change.

You can also install grunt system-wide with `sudo npm install -g grunt-cli`.
