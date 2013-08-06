module.exports = function(grunt) {
  
  // node node_modules/browserify/bin/cmd.js -r ./lib/bitcoinjs -o lol.js


  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-shell');
  

/*
    browserify: {
      'public/js/lib/bitcoinjs.js': ['lib/bitcoinjs/index.js'],
    }, options: {
      alias: 'public/js/lib/bitcoinjs.js:bitcoin',
      debug: true
    }
*/


  grunt.initConfig({
    shell: {
      browserify: {
        options: {
          stdout: true
        },
        command: 'browserify -r ./lib/bitcoinjs/index.js -o public/js/lib/bitcoinjs.js'
      }
    }
  });

  grunt.registerTask('default', ['shell']);
};