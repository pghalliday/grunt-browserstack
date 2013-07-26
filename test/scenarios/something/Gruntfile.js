module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../tasks');

  grunt.registerTask('pass', function(label) {
    grunt.log.writeln(label);
    return true;
  });

  grunt.registerTask('default', [
    'pass:first'
  ]);
};
