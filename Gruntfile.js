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
        command: 'browserify -r ./lib/bitcoinjs/index.js | ./node_modules/.bin/uglifyjs > public/js/lib/bitcoinjs.js'
      }
    },
    
    uglify: {
      coinpunk: {
        options: {
          beautify: false
        },
        files: {
          'public/js/all.js': [
            'public/js/lib/jquery.js',
            'public/js/lib/bootstrap.min.js',
            'public/js/lib/underscore.js',
            'public/js/lib/password_strength.js',
            'public/js/lib/jquery.strength.js',
            'public/js/lib/sjcl/sjcl.js',
            'public/js/lib/humane_dates.js',
            'public/js/lib/path.min.js',
            'public/js/lib/filesaver.js',
            'public/js/lib/bignumber.js',
            'public/js/lib/sockjs.js',
            'public/js/coinpunk.js',
            'public/js/coinpunk/models/database.js',
            'public/js/coinpunk/models/wallet.js',
            'public/js/coinpunk/controller.js',
            'public/js/coinpunk/controllers/accounts.js',
            'public/js/coinpunk/controllers/dashboard.js',
            'public/js/coinpunk/controllers/tx.js',
            'public/js/coinpunk/router.js',
            'public/js/coinpunk/pricing.js'
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
    },
  });

  grunt.event.on('watch', function(action, filepath) {
    grunt.config(['uglify'], filepath);
  });

  grunt.registerTask('default', ['shell', 'uglify']);
};