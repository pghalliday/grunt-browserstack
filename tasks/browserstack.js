/*
 * grunt-browserstack
 * https://github.com/pghalliday/grunt-browserstack
 *
 * Copyright (c) 2012 Peter Halliday
 * Licensed under the MIT license.
 */

var BrowserStack = require('simplified-browserstack');
var BrowserStackTunnel = require('browserstacktunnel-wrapper');
var spawn = require('child_process').spawn;
var fs = require('fs-extra');
var tail = require('tailfd').tail;
var path = require('path');

var DEFAULT_TUNNEL_START_TIMEOUT = 30000;
var tempDir = '.grunt-browserstack';
var tunnelTempDir = path.join(tempDir, 'tunnel');
var tunnelLogFile = path.join(tunnelTempDir, 'out.log');
var tunnelPidFile = path.join(tunnelTempDir, 'pid');

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
      var timeout, child, watcher, out, err;
      var cleanUp = function() {
        fs.closeSync(out);
        fs.closeSync(err);
        watcher.close();
        clearTimeout(timeout);        
        child.removeListener('exit', exitHandler);
      };
      var exitHandler = function() {
        cleanUp();
        grunt.fail.warn(new Error('Exited.'));
      };
      var timeoutHandler = function() {
        cleanUp();
        child.kill();
        grunt.fail.warn(new Error('Timed out.'));
      };
      var end = function() {
        cleanUp();
        done();
      };
      fs.createFileSync(tunnelLogFile);
      fs.createFileSync(tunnelPidFile);
      out = fs.openSync(tunnelLogFile, 'a');
      err = fs.openSync(tunnelLogFile, 'a');
      watcher = tail(tunnelLogFile,function(line,tailInfo){
        grunt.log.writeln(line);
        if (line === 'Press Ctrl-C to exit') {
          watcher.close();
          end();
        }
      });
      child = spawn('java', options, {
        detached: true,
        stdio: ['ignore', out, err]
      });
      fs.writeFileSync(tunnelPidFile, child.pid, {
        flag: 'w+'
      });
      child.on('exit', exitHandler);
      child.unref();
      timeout = setTimeout(timeoutHandler, grunt.config('browserstackTunnel.timeout') || DEFAULT_TUNNEL_START_TIMEOUT);
    } else if (action === 'stop') {
      pid = parseInt(fs.readFileSync(tunnelPidFile));
      process.kill(pid);
    } else {
      grunt.fail.warn(new Error('Unknown action.'));
    }
  });
};
