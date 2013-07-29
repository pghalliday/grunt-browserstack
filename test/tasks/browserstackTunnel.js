var expect = require('chai').expect;
var net = require('net');
var execScenario = require('../utils').execScenario;
var overrideBrowserStackCredentials = require('../utils').overrideBrowserStackCredentials;


describe('browserstackTunnel', function() {
  before(function() {
    overrideBrowserStackCredentials();
  });

  it('should fail if an unknown action is specified', function(done) {
    execScenario('browserstackTunnel/unknownAction', function(error, stdout, stderr) {
      expect(stdout).to.match(/Unknown action\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  });

  it('should fail to start if the API key is not specified', function(done) {
    execScenario('browserstackTunnel/startNoApiKey', function(error, stdout, stderr) {
      expect(stdout).to.match(/Warning: Required config property "browserstackTunnel.apiKey" missing\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  });

  it('should fail to start if the hosts are not specified', function(done) {
    execScenario('browserstackTunnel/startNoHosts', function(error, stdout, stderr) {
      expect(stdout).to.match(/Warning: Required config property "browserstackTunnel.hosts" missing\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  });

  it('should fail to start if hosts is not an array', function(done) {
    execScenario('browserstackTunnel/startHostsNotAnArray', function(error, stdout, stderr) {
      expect(stdout).to.match(/hosts parameter must be an array\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  });

  it('should fail to start if host entry has no name', function(done) {
    execScenario('browserstackTunnel/startHostNoName', function(error, stdout, stderr) {
      expect(stdout).to.match(/host entry must have a name\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  });

  it('should fail to start if host entry has no port', function(done) {
    execScenario('browserstackTunnel/startHostNoPort', function(error, stdout, stderr) {
      expect(stdout).to.match(/host entry must have a port\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  });

  it('should fail to start if host entry has no ssl flag', function(done) {
    execScenario('browserstackTunnel/startHostNoSslFlag', function(error, stdout, stderr) {
      expect(stdout).to.match(/host entry must have an sslFlag\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  });

  it('should fail if the child process exits before the tunnel has started', function(done) {
    execScenario('browserstackTunnel/startExit', function(error, stdout, stderr) {
      expect(stdout).to.match(/Exited\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  });

  it('should fail if it fails to start within the specified timeout', function(done) {
    server = net.createServer();
    server.listen(8000, function() {
      execScenario('browserstackTunnel/startTimeout', function(error, stdout, stderr) {
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
      execScenario('browserstackTunnel/start', function(error, stdout, stderr) {
        expect(stdout).to.match(/Press Ctrl-C to exit/);
        expect(stdout).to.match(/Done, without errors./);
        execScenario('browserstackTunnel/start', 'stop', function(error, stdout, stderr) {
          expect(stdout).to.match(/Done, without errors./);
          server.close(function() {
            done();
          });
        });
      });
    });
  });
});
