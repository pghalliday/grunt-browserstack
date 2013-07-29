/*
 * grunt-browserstack
 * https://github.com/pghalliday/grunt-browserstack
 *
 * Copyright (c) 2012 Peter Halliday
 * Licensed under the MIT license.
 */

var spawn = require('child_process').spawn;
var fs = require('fs-extra');
var tail = require('tailfd').tail;
var path = require('path');
var express = require('express');
var http = require('http');

var DEFAULT_TUNNEL_START_TIMEOUT = 30000;
var tempDir = '.grunt-browserstack';
var tunnelTempDir = path.join(tempDir, 'tunnel');
var tunnelLogFile = path.join(tunnelTempDir, 'out.log');
var tunnelPidFile = path.join(tunnelTempDir, 'pid');

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
      var timeout, child, watcher, out, err;
      var cleanUp = function() {
        watcher.close();
        fs.closeSync(out);
        fs.closeSync(err);
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

  grunt.registerTask('browserstackScreenshotServer', 'start and stop the BrowserStack screenshot server', function(action) {
    if (action == 'start') {
      grunt.config.requires('browserstackScreenshotServer.port');
      done = this.async();
      expressServer = express();
      httpServer = http.createServer(expressServer);
      httpServer.listen(grunt.config('browserstackScreenshotServer.port'), done);
    } else if (action == 'stop') {
      done = this.async();
      httpServer.close(done);
    } else {
      grunt.fail.warn(new Error('Unknown action.'));
    }
  });

  grunt.registerTask('browserstackScreenshot', 'Schedule and collect screenshots from the BrowserStackweb service', function(action) {
  });
};