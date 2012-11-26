/*
 * grunt-browserstack
 * https://github.com/pghalliday/grunt-browserstack
 *
 * Copyright (c) 2012 Peter Halliday
 * Licensed under the MIT license.
 */

var BrowserStack = require('simplified-browserstack');
var BrowserStackTunnel = require('browserstacktunnel-wrapper');

module.exports = function(grunt) {
  function startBrowsers(credentials, start, callback) {
    var browserStack = new BrowserStack(credentials);
    browserStack.start(start, function(errors, workers) {
      if (errors) {
        callback(errors);
      } else {
        grunt.log.ok('Workers started:');
        console.log('');
        console.log(workers);
        console.log('');
        grunt.log.ok('press any key to end them');
        console.log('');

        process.stdin.setRawMode(true);    
        process.stdin.resume();
        var end = function(chunk) {
          process.stdin.pause();
          browserStack.stop(callback);
        };
        process.stdin.on('data', end);
      }
    });
  }

  grunt.registerMultiTask('browserstack', 'start browser instances with browserstack and point them at a local port via localtunnel', function() {
    var self = this;
    var done = self.async();
    if (self.data.tunnel) {
      var browserStackTunnel = new BrowserStackTunnel(self.data.tunnel);
      browserStackTunnel.start(function(error) {
        if (error) {
          grunt.log.error(error.message);
          done(false);
        } else {
          grunt.log.ok('BrowserStackTunnel has started');
          startBrowsers(self.data.credentials, self.data.start, function(errors) {
            browserStackTunnel.stop(function(error) {
              var success = true;
              if (errors) {
                errors.forEach(function(error) {
                  grunt.log.error(error.message);
                });
                success = false;
              } 
              if (error) {
                grunt.log.error(error.message);
                success = false;
              }
              done(success);
            });
          });
        }
      });
    } else {
      startBrowsers(self.data.credentials, self.data.start, function(errors) {
        if (errors) {
          errors.forEach(function(error) {
            grunt.log.error(error.message);
          });
          done(false);
        } else {
          done();
        }
      });
    }
  });

  grunt.registerMultiTask('browserstack_clean', 'stop all running workers for the specified account', function() {
    var browserStack = new BrowserStack(this.data);
    var done = this.async();
    browserStack.clean(function(errors) {
      if (errors) {
        errors.forEach(function(error) {
          grunt.log.error(error.message);
        });
        done(false);
      } else {
        done();
      }
    });
  });

  grunt.registerMultiTask('browserstack_list', 'list available browsers', function() {
    var browserStack = new BrowserStack(this.data);
    var done = this.async();
    browserStack.list(function(error, browsers) {
      if (error) {
        grunt.log.error(error.message);
        done(false);
      } else {
        console.log(browsers);
        done();
      }
    });
  });
};
