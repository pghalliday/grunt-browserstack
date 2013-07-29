var expect = require('chai').expect;
var http = require('http');
var execScenario = require('../utils').execScenario;
var overrideBrowserStackCredentials = require('../utils').overrideBrowserStackCredentials;


describe('browserstackScreenshotServer', function() {
  before(function() {
    overrideBrowserStackCredentials();
  });

  it('should fail if an unknown action is specified', function(done) {
    execScenario('browserstackScreenshotServer/unknownAction', function(error, stdout, stderr) {
      expect(stdout).to.match(/Unknown action\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  });

  it('should fail if no port is specified', function(done) {
    execScenario('browserstackScreenshotServer/startNoPort', function(error, stdout, stderr) {
      expect(stdout).to.match(/Warning: Required config property "browserstackScreenshotServer.port" missing\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });
  }); 
});