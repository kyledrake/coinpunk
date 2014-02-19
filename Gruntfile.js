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
        command: './node_modules/browserify/bin/cmd.js -r ./lib/bitcoinjs/index.js | ./node_modules/.bin/uglifyjs > public/js/lib/bitcoinjs.js'
      },
      minifycss: {
        options: {
          stdout: true
        },
        command: 'cat public/css/bootstrap.css public/css/font-awesome.css public/css/fonts.css | ./node_modules/.bin/cleancss -o public/css/all.css'
      }
    },

    uglify: {
      coinpunk: {
        options: {
          "beautify": false,
          "screw-ie8": true
        },
        files: {
          'public/js/all.js': [
            'public/js/**/*.js',
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
