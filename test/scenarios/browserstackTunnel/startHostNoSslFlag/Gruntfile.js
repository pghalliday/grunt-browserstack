module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../../tasks');

  browserStackCredentials = grunt.file.readJSON('../../browserStackCredentials.json')

  grunt.initConfig({
    browserstackTunnel: {
      apiKey: browserStackCredentials.apiKey,
      hosts: [{
        name: 'localhost',
        port: 8000
      }]
    }
  });

  grunt.registerTask('default', [
    'browserstackTunnel:start'
  ]);
};
