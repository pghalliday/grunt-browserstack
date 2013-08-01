module.exports = function(grunt) {
  // Add our custom tasks.
  grunt.loadTasks('../../../../tasks');

  browserStackCredentials = grunt.file.readJSON('../../browserstackCredentials.json')

  grunt.initConfig({
    browserstackScreenshotServer: {
      port: 8000,
      apikey: browserStackCredentials.apikey
    },
    browserstackTunnel: {
      apikey: browserStackCredentials.apikey,
      hosts: [{
        name: 'localhost',
        port: 8000,
        sslFlag: 0
      }]
    },
    browserstackScreenshot: {
      local: {
        rootDir: 'static',
        files: [
          '**/*.html'
        ]
      },
      browsers: [{
        "os":"Windows",
        "os_version":"XP",
        "browser":"ie",
        "browser_version":"7.0"
      }, {
        "os":"ios",
        "os_version":"6.0",
        "device":"iPhone 4S (6.0)"
      }],
      outputDir: 'screenshots'
    }
  });

  grunt.registerTask('default', [
    'browserstackScreenshotServer:start',
    'browserstackTunnel:start',
    'browserstackScreenshot',
    'browserstackTunnel:stop',
    'browserstackScreenshotServer:stop'
  ]);
};
