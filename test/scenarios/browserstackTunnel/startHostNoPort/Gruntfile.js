module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../../tasks');

  browserStackCredentials = grunt.file.readJSON('../../browserStackCredentials.json')

  grunt.initConfig({
    browserstackTunnel: {
      apiKey: browserStackCredentials.apiKey,
      hosts: [{
        name: 'localhost',
        sslFlag: 0
      }]
    }
  });

  grunt.registerTask('default', [
    'browserstackTunnel:start'
  ]);
};
