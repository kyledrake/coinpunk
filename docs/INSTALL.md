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

Edit the file to connect to `insight api`. Remove the `testnet` entry for production:

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
node start.js
```


Try to connect by going to http://YOURADDRESS.COM:8080  (If you're using the SSL config then try  http://YOURADDRESS.COM:8085. OR https://YOURADDRESS.COM:8086) If it loads, then you should be ready to use Coinpunk!

## Backing up Database

Redis maintains a file called `/var/lib/redis/dump.rdb`, which is a backup of your Redis database. It is safe to copy this file while Redis is running. **It is strongly recommended that you backup this file frequently.** You can also setup a Redis slave to listen to master in real time. Ideally you should do both!

## Extra Steps for Contributors

If you want to contribute code to this project, you will need to use Grunt. Grunt is a task-runner that presently handles minifying and uglifying Coinpunk's CSS and JS resources.  Grunt is installed by the `npm install` you ran from the coinpunk directory.

Running `./node_modules/grunt-cli/bin/grunt` in your Coinpunk directory will minify and uglify everything, and running `./node_modules/grunt-cli/bin/grunt watch` will automatically uglify your JS files when they change.

You can also install grunt system-wide with `sudo npm install -g grunt-cli`.
