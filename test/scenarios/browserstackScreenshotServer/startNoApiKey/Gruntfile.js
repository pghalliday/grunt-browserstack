module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../../tasks');

  grunt.initConfig({
    browserstackScreenshotServer: {
      port: 8000
    }
  });

  grunt.registerTask('default', [
    'browserstackScreenshotServer:start'
  ]);
};
