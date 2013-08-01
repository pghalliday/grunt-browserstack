var supertest = require('supertest');
var fs = require('fs-extra');
var path = require('path');
var chai = require('chai');
var expect = require('chai').expect;
chai.should();

var Server = require('../../../tasks/ScreenshotServer/Server');
var overrideBrowserStackCredentials = require('../../utils').overrideBrowserStackCredentials;

describe.skip('tasks/ScreenshotServer/Server', function() {
  var request = supertest('http://localhost:8000');
  var server;

  before(function() {
    overrideBrowserStackCredentials();
    var browserstackCredentials = require('../../scenarios/browserstackCredentials');
    server = new Server({
      port: 8000,
      apikey: browserstackCredentials.apikey,
      username: browserstackCredentials.username
    });
  });

  it('should start and stop', function(done) {
    server.start(function(error) {
      expect(error).to.not.be.ok;
      request.get('/')
      .expect(200)
      .expect(/BrowserStack Screenshot Server/)
      .end(function(error) {
        expect(error).to.not.be.ok;
        server.stop(function(error) {
          expect(error).to.not.be.ok;
          request.get('/')
          .end(function(error) {
            error.message.should.equal('connect ECONNREFUSED');
            done();
          });
        });
      });
    });
  });

  describe('POST /requests', function() {
    before(function(done) {
      server.start(done);
    });

    after(function(done) {
      server.stop(done);
    });

    describe('with local files', function() {
      it('should submit the screenshot request to browserstack and download the generated screenshots', function(done) {
        var outputDir = path.join(__dirname, '../../scenarios/ScreenshotServer/screenshots');
        fs.removeSync(outputDir)
        request.post('/requests')
        .send({
          local: {
            rootDir: path.join(__dirname, '../../scenarios/browserstackScreenshot/localFiles/static'),
            files: [
              '**/*.html'
            ]
          },
          variations: [{
            os: 'Windows',
            os_version: 'XP',
            browser: 'ie',
            browser_version: '7.0',
            resolution: '1024x768'
          }, {
            os: 'OS X',
            os_version: 'Lion',
            browser: 'chrome',
            browser_version: '14.0',
            resolution: '1920x1080'
          }, {
            os: 'ios',
            os_version: '6.0',
            device: 'iPhone 4S (6.0)',
            orientation: 'portrait'
          }],
          outputDir: outputDir
        })
        .expect(200)
        .end(function(error, response) {
          expect(error).to.not.be.ok;
          fs.existsSync(outputDir).should.be.true;
          var result = response.body;
          outputSubdir = path.join(outputDir, result.id);
          fs.existsSync(outputSubdir).should.be.true;
          var ieOutputDirectory = path.join(outputSubdir, 'Windows/XP/ie/7.0/1024x768');
          fs.existsSync(path.join(ieOutputDirectory, 'test1.html.png')).should.be.true;
          fs.existsSync(path.join(ieOutputDirectory, 'test2.html.png')).should.be.true;
          fs.existsSync(path.join(ieOutputDirectory, 'subfolder/test3.html.png')).should.be.true;
          fs.existsSync(path.join(ieOutputDirectory, 'test1.html.thumb.jpg')).should.be.true;
          fs.existsSync(path.join(ieOutputDirectory, 'test2.html.thumb.jpg')).should.be.true;
          fs.existsSync(path.join(ieOutputDirectory, 'subfolder/test3.html.thumb.jpg')).should.be.true;
          var chromeOutputDirectory = path.join(outputSubdir, 'OS X/Lion/chrome/14.0/1920x1080');
          fs.existsSync(path.join(chromeOutputDirectory, 'test1.html.png')).should.be.true;
          fs.existsSync(path.join(chromeOutputDirectory, 'test2.html.png')).should.be.true;
          fs.existsSync(path.join(chromeOutputDirectory, 'subfolder/test3.html.png')).should.be.true;
          fs.existsSync(path.join(chromeOutputDirectory, 'test1.html.thumb.jpg')).should.be.true;
          fs.existsSync(path.join(chromeOutputDirectory, 'test2.html.thumb.jpg')).should.be.true;
          fs.existsSync(path.join(chromeOutputDirectory, 'subfolder/test3.html.thumb.jpg')).should.be.true;
          var iosOutputDirectory = path.join(outputSubdir, 'ios/6.0/iPhone 4S (6.0)/portrait');
          fs.existsSync(path.join(iosOutputDirectory, 'test1.html.png')).should.be.true;
          fs.existsSync(path.join(iosOutputDirectory, 'test2.html.png')).should.be.true;
          fs.existsSync(path.join(iosOutputDirectory, 'subfolder/test3.html.png')).should.be.true;
          fs.existsSync(path.join(iosOutputDirectory, 'test1.html.thumb.jpg')).should.be.true;
          fs.existsSync(path.join(iosOutputDirectory, 'test2.html.thumb.jpg')).should.be.true;
          fs.existsSync(path.join(iosOutputDirectory, 'subfolder/test3.html.thumb.jpg')).should.be.true;
          done();
        });
      });
    });
  });
});
