var expect = require('chai').expect;
var http = require('http');
var execScenario = require('../utils').execScenario;
var overrideBrowserStackCredentials = require('../utils').overrideBrowserStackCredentials;


describe('browserstackScreenshot', function() {
  before(function() {
    overrideBrowserStackCredentials();
  });

  it('should collect screenshots for local files', function(done) {
    execScenario('browserstackScreenshot/localFiles', function(error, stdout, stderr) {
      expect(stdout).to.match(/Done, without errors./);
      done();
    });
  });
});
