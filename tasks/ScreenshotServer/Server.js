var express = require('express');
var http = require('http');
var uuid = require('node-uuid');
var superagent = require('superagent');
var Q = require('q');
var glob = require('glob');
var fs = require('fs-extra');
var path = require('path');
var url = require('url');

function ScreenshotServer(params) {
  var self = this;
  var app = express()
  var server = http.createServer(app);
  var inProgress = {};
  var browserstackUrl = 'http://' + params.username + ':' + params.apikey + '@www.browserstack.com/screenshots';
  var connections = {};

  server.on('connection', function(connection) {
    var id = uuid.v1();
    connections[id] = connection;
    connection.on('end', function() {
      delete connections[id];
    });
  });

  app.use(express.bodyParser());

  app.get('/', function(request, response) {
    response.send('BrowserStack Screenshot Server');
  });

  app.post('/screenshots/:id', function(request, response) {
    var deferredParams = inProgress[request.params.id];
    if (deferredParams) {
      delete inProgress[request.params.id];
      var screenshot = request.body.screenshots[0];
      var thumbUrl = screenshot.thumb_url;
      var imageUrl = screenshot.image_url;
      var promises = [];
      // TODO: grab screenshots
      deferredParams.deferred.resolve();
      response.send(201);
    } else {
      response.send(200);
    }
  });

  app.post('/requests', function(request, response) {
    var requestParams = request.body;
    var result = {
      id: uuid.v1()
    };
    var outputDir = path.join(requestParams.outputDir, result.id);
    fs.mkdirsSync(outputDir);
    var promises = [];
    requestParams.variations.forEach(function(variation) {
      var outputSubDir = path.join(outputDir, variation.os, variation.os_version);
      if (variation.device) {
        outputSubDir = path.join(outputSubDir, variation.device, variation.orientation);
      } else {
        outputSubDir = path.join(outputSubDir, variation.browser, variation.browser_version, variation.resolution);
      }
      outputSubDir = path.join(outputSubDir, '' + variation.wait_time);
      var screenshotRequests = [];
      var statics = requestParams.statics;
      var urls = requestParams.urls;
      if (statics) {
        var staticsOutputDir = path.join(outputSubDir, 'statics');
        statics.forEach(function(static) {
          var staticOutputDir = path.join(staticsOutputDir, static.alias);
          var rootDir = static.rootDir;
          app.use('/static/' + result.id + '/' + static.alias, express.static(rootDir));
          static.files.forEach(function(filesGlob) {
            var files = glob.sync(filesGlob, {cwd: rootDir});
            files.forEach(function(file) {
              screenshotRequests.push({
                url: url.resolve('http://localhost:' + params.port + '/static/' + result.id + '/' + static.alias + '/start', file),
                thumbPath: path.join(staticOutputDir, file + '.thumb.jpg'),
                imagePath: path.join(staticOutputDir, file + '.png')
              });
            });
          });
        });
      }
      if (urls) {
        var urlsOutputDir = path.join(outputSubDir, 'urls');
        urls.forEach(function(url) {
          screenshotRequests.push({
            url: url.url,
            thumbPath: path.join(urlsOutputDir, url.alias + '.thumb.jpg'),
            imagePath: path.join(urlsOutputDir, url.alias + '.png')
          });
        });
      }
      screenshotRequests.forEach(function(screenshotRequest) {
        var id = uuid.v1();
        var deferredParams = inProgress[id] = {
          deferred: Q.defer(),
          thumbPath: screenshotRequest.thumbPath,
          imagePath: screenshotRequest.imagePath
        };
        promises.push(deferredParams.deferred.promise);
        var postedData = {
          url: screenshotRequest.url,
          callback_url: 'http://localhost:' + params.port + '/screenshots/' + id,
          win_res: (variation.os === 'Windows' ? variation.resolution : undefined),
          mac_res: (variation.os === 'OS X' ? variation.resolution : undefined),
          quality: 'compressed',
          wait_time: variation.wait_time,
          orientation: variation.orientation,
          browsers:[{
            os: variation.os,
            os_version: variation.os_version,
            browser: variation.browser,
            browser_version: variation.browser_version,
            device: variation.device
          }]
        };
        superagent.post(browserstackUrl)
        .set('Content-Type', 'application/json')
        .send(postedData)
        .end(function(error, response) {
          error = error || response.error;
          if (error) {
            delete inProgress[id];
            deferredParams.deferred.reject(error);
          }
          console.log(variation.os);
          console.log(response.text);
        });
      });
    });
    Q.allSettled(promises)
    .then(function(results) {
      console.log(results);
      result.results = results;
      response.send(result);
    });
  });

  self.start = function(callback) {
    server.listen(params.port, callback);
  };

  self.stop = function(callback) {
    for (var id in connections) {
      connections[id].end();
    }
    server.close(callback);
  };
}
module.exports = ScreenshotServer;
