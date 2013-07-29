module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../../tasks');

  grunt.initConfig({
    browserstackScreenshotServer: {
    }
  });

  grunt.registerTask('default', [
    'browserstackScreenshotServer:start'
  ]);
};
