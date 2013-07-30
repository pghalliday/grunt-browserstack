/*
 * grunt-browserstack
 * https://github.com/pghalliday/grunt-browserstack
 *
 * Copyright (c) 2012 Peter Halliday
 * Licensed under the MIT license.
 */
var path = require('path');
var LooseDaemon = require('./LooseDaemon');

var tempDir = '.grunt-browserstack';

var DEFAULT_TUNNEL_START_TIMEOUT = 30000;
var tunnelTempDir = path.join(tempDir, 'tunnel');
var tunnelDaemon = new LooseDaemon(tunnelTempDir);

var DEFAULT_SCREENSHOT_SERVER_START_TIMEOUT = 30000;
var screenshotServerTempDir = path.join(tempDir, 'screenshot-server');
var screenshotServerDaemon = new LooseDaemon(screenshotServerTempDir);

var expressServer, httpServer;

module.exports = function(grunt) {
  grunt.registerTask('browserstackTunnel', 'start and stop the BrowserStack tunnel', function(action) {
    if (action === 'start') {
      grunt.config.requires('browserstackTunnel.apiKey', 'browserstackTunnel.hosts');
      var options = [
        '-jar',
        path.join(__dirname, '../bin/BrowserStackTunnel.jar'),
        grunt.config('browserstackTunnel.apiKey')
      ];
      hosts = grunt.config('browserstackTunnel.hosts');
      if (hosts instanceof Array) {
        hosts.forEach(function(host) {
          if (typeof host.name === 'string') {
            if (typeof host.port === 'number' || typeof host.port === 'string') {
              if (typeof host.sslFlag === 'number' || typeof host.sslFlag === 'string') {
                options.push(host.name + ',' + host.port + ',' + host.sslFlag);
              } else {
                grunt.fail.warn(new Error('host entry must have an sslFlag.'));
              }
            } else {
              grunt.fail.warn(new Error('host entry must have a port.'));
            }
          } else {
            grunt.fail.warn(new Error('host entry must have a name.'));
          }
        });
      } else {
        grunt.fail.warn(new Error('hosts parameter must be an array.'));
      }
      var done = this.async();
      tunnelDaemon.start({
        cmd: 'java',
        args: options,
        regexp: /Press Ctrl-C to exit/,
        timeout: grunt.config('browserstackTunnel.timeout') || DEFAULT_TUNNEL_START_TIMEOUT
      }, function(error) {
        if (error) {
          grunt.fail.warn(error);
        } else {
          done();
        }
      });
    } else if (action === 'stop') {
      var done = this.async();
      tunnelDaemon.stop(function(error) {
        if (error) {
          grunt.fail.warn(error);
        } else {
          done();
        }
      });
    } else {
      grunt.fail.warn(new Error('Unknown action.'));
    }
  });

  grunt.registerTask('browserstackScreenshotServer', 'start and stop the BrowserStack screenshot server', function(action) {
    if (action == 'start') {
      grunt.config.requires('browserstackScreenshotServer.port');
      var done = this.async();
      var port = grunt.config('browserstackScreenshotServer.port');
      screenshotServerDaemon.start({
        cmd: 'node',
        args: [
          path.join(__dirname, 'ScreenshotServer'),
          port
        ],
        regexp: new RegExp('BrowserStack screenshot server listening on port ' + port),
        timeout: grunt.config('browserstackScreenshotServer.timeout') || DEFAULT_SCREENSHOT_SERVER_START_TIMEOUT
      }, function(error) {
        if (error) {
          grunt.fail.warn(error);
        } else {
          done();
        }
      });
    } else if (action == 'stop') {
      var done = this.async();
      screenshotServerDaemon.stop(function(error) {
        if (error) {
          grunt.fail.warn(error);
        } else {
          done();
        }
      });
    } else {
      grunt.fail.warn(new Error('Unknown action.'));
    }
  });

  grunt.registerTask('browserstackScreenshot', 'Schedule and collect screenshots from the BrowserStack web service', function(action) {
  });
};