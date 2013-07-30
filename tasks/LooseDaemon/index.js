var spawn = require('child_process').spawn;
var fs = require('fs-extra');
var tail = require('tailfd').tail;
var path = require('path');

function LooseDaemon(home) {
  var self = this;
  var logFile = path.join(home, 'log');
  var pidFile = path.join(home, 'pid');

  self.start = function(params, callback) {
    if (params.cmd) {
      if (params.regexp) {
        if (params.timeout) {
          var timeout, child, watcher, out, err, output, pid;
          var cleanUp = function() {
            watcher.close();
            fs.closeSync(out);
            fs.closeSync(err);
            clearTimeout(timeout);        
            child.removeListener('exit', exitHandler);
          };
          var exitHandler = function() {
            cleanUp();
            if (callback) {
              callback(new Error('Exited.'));
            }
          };
          var timeoutHandler = function() {
            cleanUp();
            child.kill();
            if (callback) {
              callback(new Error('Timed out.'));
            }
          };
          var end = function() {
            cleanUp();
            console.log('Process detached with PID ' + pid);
            if (callback) {
              callback();
            }
          };
          fs.createFileSync(logFile);
          fs.createFileSync(pidFile);
          out = fs.openSync(logFile, 'a');
          err = fs.openSync(logFile, 'a');
          watcher = tail(logFile);
          watcher.on('data', function(data, tailInfo){
            fragment = data.toString();
            process.stdout.write(fragment);
            output += fragment;
            if (params.regexp.test(output)) {
              end();
            }
          })
          var args = params.args || [];
          child = spawn(params.cmd, args, {
            detached: true,
            stdio: ['ignore', out, err]
          });
          pid = child.pid;
          fs.writeFileSync(pidFile, pid, {
            flag: 'w+'
          });
          child.on('exit', exitHandler);
          child.unref();
          timeout = setTimeout(timeoutHandler, params.timeout);
        } else {
          if (callback) {
            callback(new Error('timeout must be specified.'));
          }
        }
      } else {
        if (callback) {
          callback(new Error('regexp must be specified.'));
        }
      }
    } else {
      if (callback) {
        callback(new Error('cmd must be specified.'));
      }
    }
  };

  self.stop = function(callback) {
    pid = parseInt(fs.readFileSync(pidFile));
    process.kill(pid);
    console.log('Process with PID ' + pid + ' killed');
    callback();
  };
}
module.exports = LooseDaemon;