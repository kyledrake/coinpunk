module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.initConfig({
    shell: {
      browserify: {
        options: {
          stdout: true
        },
        command: grunt.option('target') === 'dev' 
                ? './node_modules/browserify/bin/cmd.js -r ./lib/bitcoinjs/index.js > public/js/lib/bitcoinjs.js'
                : './node_modules/browserify/bin/cmd.js -r ./lib/bitcoinjs/index.js | ./node_modules/.bin/uglifyjs  > public/js/lib/bitcoinjs.js'
      },
      minifycss: {
        options: {
          stdout: true
        },
        command: grunt.option('target') === 'dev' 
          ? 'cat public/css/bootstrap.css public/css/font-awesome.css public/css/fonts.css > public/css/all.css'
          : 'cat public/css/bootstrap.css public/css/font-awesome.css public/css/fonts.css | ./node_modules/.bin/cleancss -o public/css/all.css'
      }
    },
    uglify: {
      coinpunk: {
        options: {
          "mangle": grunt.option('target') === 'dev' ? false : true,
          "beautify": grunt.option('target') === 'dev' ? true : false,
          "screw-ie8": true
        },
        files: {
          'public/js/all.js': [
            'public/js/lib/jquery.js',
            'public/js/lib/bootstrap.js',
            'public/js/lib/underscore.js',
            'public/js/lib/password_strength.js',
            'public/js/lib/jquery.strength.js',
            'public/js/lib/sjcl.js',
            'public/js/lib/humane_dates.js',
            'public/js/lib/path.min.js',
            'public/js/lib/filesaver.js',
            'public/js/lib/bignumber.js',
            'public/js/lib/sockjs.js',
            'public/js/lib/URI.js',
            'public/js/lib/jsqrcode/grid.js',
            'public/js/lib/jsqrcode/version.js',
            'public/js/lib/jsqrcode/detector.js',
            'public/js/lib/jsqrcode/formatinf.js',
            'public/js/lib/jsqrcode/errorlevel.js',
            'public/js/lib/jsqrcode/bitmat.js',
            'public/js/lib/jsqrcode/datablock.js',
            'public/js/lib/jsqrcode/bmparser.js',
            'public/js/lib/jsqrcode/datamask.js',
            'public/js/lib/jsqrcode/rsdecoder.js',
            'public/js/lib/jsqrcode/gf256poly.js',
            'public/js/lib/jsqrcode/gf256.js',
            'public/js/lib/jsqrcode/decoder.js',
            'public/js/lib/jsqrcode/qrcode.js',
            'public/js/lib/jsqrcode/findpat.js',
            'public/js/lib/jsqrcode/alignpat.js',
            'public/js/lib/jsqrcode/databr.js',
            'public/js/lib/qrcode.js',
            'public/js/coinpunk.js',
            'public/js/coinpunk/utils.js',
            'public/js/coinpunk/template.js',
            'public/js/coinpunk/models/database.js',
            'public/js/coinpunk/models/wallet.js',
            'public/js/coinpunk/controller.js',
            'public/js/coinpunk/controllers/accounts.js',
            'public/js/coinpunk/controllers/addresses.js',
            'public/js/coinpunk/controllers/dashboard.js',
            'public/js/coinpunk/controllers/tx.js',
            'public/js/coinpunk/pricing.js',
            'public/js/coinpunk/router.js'
          ]
        }
      }
    },
    watch: {
      scripts: {
        files: ['public/js/**/*.js'],
        tasks: ['uglify:coinpunk'],
        options: {
          spawn: false,
        },
      },
      scriptsBrowserify: {
        files: ['lib/bitcoinjs/**/*.js'],
        tasks: ['shell:browserify'],
        options: {
          spawn: false,
        },
      },
    },
  });
/*
  grunt.event.on('watch', function(action, filepath) {
    grunt.config(['uglify'], filepath);
  });
*/
  grunt.registerTask('default', ['shell', 'uglify']);
};
