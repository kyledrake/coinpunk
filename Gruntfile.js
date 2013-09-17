module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-shell');

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