module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-blanket');
  grunt.loadNpmTasks('grunt-mocha-test');

  // Project configuration.
  grunt.initConfig({
    clean: {
      coverage: {
        src: ['lib-cov/']
      }
    },
    copy: {
      test: {
        src: ['test/**'],
        dest: 'lib-cov/'
      }
    },
    blanket: {
      tasks: {
        src: ['tasks/'],
        dest: 'lib-cov/tasks/'
      }
    },
    mochaTest: {
      all: {
        options: {
          reporter: 'spec',
          // tests are quite slow as thy spawn node processes
          timeout: 4000
        },
        src: ['lib-cov/test/tasks/**/*.js']
      },
      'html-cov': {
        options: {
          reporter: 'html-cov',
          quiet: true,
          captureFile: 'coverage.html'
        },
        src: ['lib-cov/test/tasks/**/*.js']
      },
      'travis-cov': {
        options: {
          reporter: 'travis-cov'
        },
        src: ['lib-cov/test/tasks/**/*.js']
      }
    },
  });

  // Default task.
  grunt.registerTask('build', ['clean', 'blanket', 'copy']);
  grunt.registerTask('default', ['build', 'mochaTest']);
};
