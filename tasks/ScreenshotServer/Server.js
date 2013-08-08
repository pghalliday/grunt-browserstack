var express = require('express');
var http = require('http');
var uuid = require('node-uuid');
var superagent = require('superagent');
var Q = require('q');
var glob = require('glob');
var fs = require('fs-extra');
var path = require('path');
var url = require('url');

var RETRY_TIME = 5000;

function ScreenshotServer(params) {
  var self = this;
  var app = express()
  var server = http.createServer(app);
  var inProgress = {};
  var browserstackUrl = 'http://' + params.username + ':' + params.apikey + '@www.browserstack.com/screenshots';
  var connections = {};
  var concurrentRequests = 0;

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
    console.log('/screenshots/:id');
    console.log(request.params.id);
    var deferredParams = inProgress[request.params.id];
    if (deferredParams) {
      concurrentRequests--;
      delete inProgress[request.params.id];
      var screenshot = response.body.screenshots[0];
      var thumbUrl = screenshot.thumb_url;
      var imageUrl = screenshot.image_url;
      // TODO: grab screenshots
      console.log(screenshot);
      deferredParams.response.write(JSON.stringify({
        type: 'complete',
        screenshotRequest: deferredParams.screenshotRequest,
        body: response.body
      }));
      deferredParams.response.write('\n');
      deferredParams.deferred.resolve();
      response.send(201);
    } else {
      response.send(200);
    }
  });

  app.post('/requests', function(request, response) {
    var requestParams = request.body;
    var transactionId = uuid.v1()
    response.status(201);
    response.set('Content-Type', 'application/x-json-stream');
    response.write(JSON.stringify({
      type: 'begin',
      transactionId: transactionId
    }));
    response.write('\n');
    var outputDir = path.join(requestParams.outputDir, transactionId);
    fs.mkdirsSync(outputDir);
    var promises = [];
    var requestQueue = [];
    var statics = requestParams.statics;
    var urls = requestParams.urls;
    requestParams.variations.forEach(function(variation) {
      var outputSubDir = path.join(outputDir, variation.os, variation.os_version);
      if (variation.device) {
        outputSubDir = path.join(outputSubDir, variation.device, variation.orientation);
      } else {
        outputSubDir = path.join(outputSubDir, variation.browser, variation.browser_version, variation.resolution);
      }
      outputSubDir = path.join(outputSubDir, '' + variation.wait_time);
      var screenshotRequests = [];
      if (statics) {
        var staticsOutputDir = path.join(outputSubDir, 'statics');
        statics.forEach(function(static) {
          var staticOutputDir = path.join(staticsOutputDir, static.alias);
          var rootDir = static.rootDir;
          app.use('/static/' + transactionId + '/' + static.alias, express.static(rootDir));
          static.files.forEach(function(filesGlob) {
            var files = glob.sync(filesGlob, {cwd: rootDir});
            files.forEach(function(file) {
              screenshotRequests.push({
                url: url.resolve('http://localhost:' + params.port + '/static/' + transactionId + '/' + static.alias + '/start', file),
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
          screenshotRequest: screenshotRequest,
          response: response
        };
        promises.push(deferredParams.deferred.promise);
        // Submit requests sequentially to make it easier to pause and retry when the concurrent limit is reached 
        requestQueue.push(function() {
          var deferred = Q.defer();
          var submit = function() {
            concurrentRequests++;
            var postedData = {
              url: screenshotRequest.url,
              callback_url: 'http://localhost:' + params.port + '/screenshots/' + id,
              win_res: (variation.os === 'Windows' ? variation.resolution : undefined),
              mac_res: (variation.os === 'OS X' ? variation.resolution : undefined),
              quality: 'compressed',
              tunnel: true,
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
            response.write(JSON.stringify({
              type: 'submit',
              concurrentRequests: concurrentRequests,
              screenshotRequest: screenshotRequest,
              postedData: postedData
            }));
            response.write('\n');
            superagent.post(browserstackUrl)
            .set('Content-Type', 'application/json')
            .send(postedData)
            .end(function(error, response) {
              error = error || response.error;
              if (error) {
                concurrentRequests--;
                if (response.body.message === 'A previous screenshot request is already in progress') {
                  // send warning with concurrent request count and set retry timeout
                  deferredParams.response.write(JSON.stringify({
                    type: 'warning',
                    screenshotRequest: screenshotRequest,
                    error: error,
                    body: response.body,
                    message: 'Concurrency limit reached at ' + concurrentRequests + ' screenshot requests. Retrying in ' + RETRY_TIME + ' msec.'
                  }));
                  deferredParams.response.write('\n');
                  setTimeout(submit, RETRY_TIME);
                } else {
                  deferredParams.response.write(JSON.stringify({
                    type: 'error',
                    screenshotRequest: screenshotRequest,
                    error: error,
                    body: response.body
                  }));
                  deferredParams.response.write('\n');
                  delete inProgress[id];
                  console.log('reject');
                  console.log('reject');
                  console.log('reject');
                  console.log('reject');
                  console.log('reject');
                  console.log('reject');
                  deferredParams.deferred.reject(error);
                  deferred.resolve();
                }
              } else {
                deferredParams.response.write(JSON.stringify({
                  type: 'accepted',
                  screenshotRequest: screenshotRequest,
                  body: response.body
                }));
                deferredParams.response.write('\n');
                deferred.resolve();
              }
            });
          };
          submit();
          return deferred.promise;
        });
      });
    });
    requestQueue.reduce(Q.when, Q()).done();
    Q.allSettled(promises)
    .then(function(results) {
      console.dir(results);
      response.write(JSON.stringify({
        type: 'done'
      }));
      response.write('\n');
      response.end();
    })
    .done();
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
