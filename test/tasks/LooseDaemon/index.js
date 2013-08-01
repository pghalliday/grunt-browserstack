var supertest = require('supertest');
var chai = require('chai');
var expect = require('chai').expect;
chai.should();

var execScenario = require('../../utils').execScenario;

describe('tasks/LooseDaemon', function() {
  it('should error if no cmd is specified', function(done) {
    execScenario('LooseDaemon/noCmd', function(error, stdout, stderr) {
      expect(stdout).to.match(/cmd must be specified\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });    
  });

  it('should error if no regexp is specified', function(done) {
    execScenario('LooseDaemon/noRegexp', function(error, stdout, stderr) {
      expect(stdout).to.match(/regexp must be specified\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });    
  });

  it('should error if no timeout is specified', function(done) {
    execScenario('LooseDaemon/noTimeout', function(error, stdout, stderr) {
      expect(stdout).to.match(/timeout must be specified\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });    
  });

  it('should error if the process exits before the regexp is matched', function(done) {
    execScenario('LooseDaemon/exit', function(error, stdout, stderr) {
      expect(stdout).to.match(/Exited\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });    
  });

  it('should error if the start times out before the regexp is matched', function(done) {
    execScenario('LooseDaemon/timeout', function(error, stdout, stderr) {
      expect(stdout).to.match(/Server listening on port 8000/);
      expect(stdout).to.match(/Timed out\./);
      expect(stdout).to.match(/Aborted due to warnings./);
      done();
    });    
  });

  it('should start and stop a spawned process from different processes', function(done) {
    execScenario('LooseDaemon/start', function(error, stdout, stderr) {
      expect(stdout).to.match(/Server listening on port 8000/);
      expect(stdout).to.match(/Process detached with PID /);
      expect(stdout).to.match(/Done, without errors./);
      var request = supertest('http://localhost:8000');
      request.get('/')
      .expect(200)
      .expect('Hello, world!')
      .end(function(error) {
        expect(error).to.not.be.ok;
        execScenario('LooseDaemon/start', 'stop', function(error, stdout, stderr) {
          expect(stdout).to.match(/Process with PID /);
          expect(stdout).to.match(/ killed/);
          expect(stdout).to.match(/Done, without errors./);
          request.get('/')
          .end(function(error) {
            error.message.should.equal('connect ECONNREFUSED');
            done();
          });
        });
      });
    });
  });
});
