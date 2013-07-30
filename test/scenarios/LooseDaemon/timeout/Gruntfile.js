module.exports = function(grunt) {
  var LooseDaemon = require('../../../../tasks/LooseDaemon');

  grunt.registerTask('default', function() {
    done = this.async();
    var looseDaemon = new LooseDaemon('.server');
    looseDaemon.start({
      cmd: 'node',
      args: [
        'server.js'
      ],
      regexp: /Wrong message/,
      timeout: 500
    }, function(error) {
      if (error) {
        grunt.fail.warn(error);
      } else {
        done();
      }
    });
  });
};
