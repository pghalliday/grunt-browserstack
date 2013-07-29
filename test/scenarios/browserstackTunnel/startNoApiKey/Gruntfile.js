module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../../tasks');

  browserStackCredentials = grunt.file.readJSON('../../browserStackCredentials.json')

  grunt.initConfig({
    browserstackTunnel: {
      hosts: [{
        name: 'localhost',
        port: 8000,
        sslFlag: 0
      }]
    }
  });

  grunt.registerTask('default', [
    'browserstackTunnel:start'
  ]);
};
