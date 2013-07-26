/*jshint loopfunc: true */

var expect = require('chai').expect;
var exec = require('child_process').exec;
var fs = require('fs');
var net = require('net');
var path = require('path');

var mergeCoverageData = function(data) {
  // we have to reconstruct the the _$jscoverage data
  // format as it cannot be stringified to JSON with
  // the additional source property added to arrays
  if (typeof global._$jscoverage === 'undefined') {
    global._$jscoverage = {};
  }
  var jscoverage = global._$jscoverage;
  var sourceArrays = data.sourceArrays;
  var callCounts = data.callCounts;
  for (var filename in sourceArrays) {
    var dest = jscoverage[filename];
    var src = callCounts[filename];
    src.source = sourceArrays[filename];
    if (typeof dest === 'undefined') {
      jscoverage[filename] = src;
    } else {
      src.forEach(function(count, index) {
        if (count !== null) {
          dest[index] += count;
        }
      });
    }
  }
};

var execScenario = function(scenario, task, callback) {
  if (typeof task === 'function') {
    callback = task;
    task = ''
  }
  var scenarioDir = path.join(__dirname, '../scenarios', scenario);
  var child = exec('node ../grunt.js ' + task, {cwd: scenarioDir}, function(error, stdout, stderr) {
    // collect coverage data from file if it exists
    // this is because the coverage tool does not
    // really work with child processes so we are
    // giving it a helping hand
    var jscoverageFile = scenarioDir + '/jscoverage.json';
    if (fs.existsSync(jscoverageFile)) {
      mergeCoverageData(JSON.parse(fs.readFileSync(jscoverageFile)));
    }
    callback(error, stdout, stderr);
  });
};

describe('grunt-browserstack', function() {
  before(function() {
    // If the environment is set then overwrite the browserStackCredentials.json
    if (process.env.BROWSERSTACK_API_KEY) {
      fs.writeFileSync(path.join(__dirname, '../scenarios', 'browserStackCredentials.json'), JSON.stringify({
        apiKey: process.env.BROWSERSTACK_API_KEY
      }), 'w+');
    }
  });

  describe('browserStackTunnel', function() {
    it('should fail if an unknown action is specified', function(done) {
      execScenario('unknownActionTunnel', function(error, stdout, stderr) {
        expect(stdout).to.match(/Unknown action\./);
        expect(stdout).to.match(/Aborted due to warnings./);
        done();
      });
    });

    it('should fail to start if the API key is not specified', function(done) {
      execScenario('startTunnelNoApiKey', function(error, stdout, stderr) {
        expect(stdout).to.match(/Warning: Required config property "browserstackTunnel.apiKey" missing\./);
        expect(stdout).to.match(/Aborted due to warnings./);
        done();
      });
    });

    it('should fail to start if the hosts are not specified', function(done) {
      execScenario('startTunnelNoHosts', function(error, stdout, stderr) {
        expect(stdout).to.match(/Warning: Required config property "browserstackTunnel.hosts" missing\./);
        expect(stdout).to.match(/Aborted due to warnings./);
        done();
      });
    });

    it('should fail to start if hosts is not an array', function(done) {
      execScenario('startTunnelHostsNotAnArray', function(error, stdout, stderr) {
        expect(stdout).to.match(/hosts parameter must be an array\./);
        expect(stdout).to.match(/Aborted due to warnings./);
        done();
      });
    });

    it('should fail to start if host entry has no name', function(done) {
      execScenario('startTunnelHostNoName', function(error, stdout, stderr) {
        expect(stdout).to.match(/host entry must have a name\./);
        expect(stdout).to.match(/Aborted due to warnings./);
        done();
      });
    });

    it('should fail to start if host entry has no port', function(done) {
      execScenario('startTunnelHostNoPort', function(error, stdout, stderr) {
        expect(stdout).to.match(/host entry must have a port\./);
        expect(stdout).to.match(/Aborted due to warnings./);
        done();
      });
    });

    it('should fail to start if host entry has no ssl flag', function(done) {
      execScenario('startTunnelHostNoSslFlag', function(error, stdout, stderr) {
        expect(stdout).to.match(/host entry must have an sslFlag\./);
        expect(stdout).to.match(/Aborted due to warnings./);
        done();
      });
    });

    it('should fail if the child process exits before the tunnel has started', function(done) {
      execScenario('startTunnelExit', function(error, stdout, stderr) {
        expect(stdout).to.match(/Exited\./);
        expect(stdout).to.match(/Aborted due to warnings./);
        done();
      });
    });

    it('should fail if it fails to start within the specified timeout', function(done) {
      server = net.createServer();
      server.listen(8000, function() {
        execScenario('startTunnelTimeout', function(error, stdout, stderr) {
          expect(stdout).to.match(/Timed out\./);
          expect(stdout).to.match(/Aborted due to warnings./);
          server.close(function() {
            done();
          });
        });
      });
    });

    it('should start and stop the BrowserStack tunnel from different processes', function(done) {
      this.timeout(20000);
      server = net.createServer();
      server.listen(8000, function() {
        execScenario('startTunnel', function(error, stdout, stderr) {
          expect(stdout).to.match(/Press Ctrl-C to exit/);
          expect(stdout).to.match(/Done, without errors./);
          execScenario('startTunnel', 'stop', function(error, stdout, stderr) {
            expect(stdout).to.match(/Done, without errors./);
            server.close(function() {
              done();
            });
          });
        });
      });
    });
  });
});