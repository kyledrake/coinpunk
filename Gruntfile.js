module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.initConfig({
    shell: {
      browserify: {
        options: {
          stdout: true
        },
        command: 'browserify -r ./lib/bitcoinjs/index.js -o public/js/lib/bitcoinjs.js'
      }
    },
    
    uglify: {
      my_target: {
        options: {
          beautify: true
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
    }
  });

  grunt.registerTask('default', ['shell']);
};