module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../../tasks');

  browserStackCredentials = grunt.file.readJSON('../../browserstackCredentials.json')

  grunt.initConfig({
    browserstackScreenshotServer: {
      apikey: browserStackCredentials.apikey
    }
  });

  grunt.registerTask('default', [
    'browserstackScreenshotServer:start'
  ]);
};
