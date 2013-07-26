module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../tasks');

  grunt.registerTask('default', [
    'browserstackTunnel:unknown'
  ]);
};
