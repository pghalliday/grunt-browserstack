module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../../tasks');

  browserStackCredentials = grunt.file.readJSON('../../browserstackCredentials.json')

  grunt.initConfig({
    browserstackTunnel: {
      apikey: browserStackCredentials.apikey
    }
  });

  grunt.registerTask('default', [
    'browserstackTunnel:start'
  ]);
};
