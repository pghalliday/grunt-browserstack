var express = require('express');
var http = require('http');
var uuid = require('node-uuid');
var superagent = require('superagent');
var Q = require('q');
var glob = require('glob');
var fs = require('fs-extra');
var path = require('path');

function ScreenshotServer(params) {
  var self = this;
  var app = express()
  var server = http.createServer(app);
  var requests = {};
  var browserstackUrl = 'http://:' + params.apiKey + '@www.browserstack.com/screenshots';

  app.use(express.bodyParser());

  app.get('/', function(request, response) {
    response.send('BrowserStack Screenshot Server');
  });

  app.post('/screenshots/:id', function(request, response) {
    console.log(request.body);
    var params = requests[request.params.id];
    if (params) {
      delete requests[request.params.id];
      var screenshot = request.body.screenshots[0];
      var thumbUrl = screenshot.thumb_url;
      var imageUrl = screenshot.image_url;
      var promises = [];
      // TODO: grab screenshots
      params.deferred.resolve();
      response.send(201);
    } else {
      response.send(200);
    }
  });

  app.post('/requests', function(request, response) {
    var params = request.body;
    var result = {
      id: uuid.v1()
    };
    fs.mkdirsSync(path.join(params.outputDir, result.id));
    app.use('/local/' + result.id, express.static(params.local.rootDir));
    var promises = [];
    params.variations.forEach(function(variation) {
      params.local.files.forEach(function(filesGlob) {
        var files = glob.sync(filesGlob, {cwd: params.local.rootDir});
        files.forEach(function(file) {
          var id = uuid.v1();
          var params = requests[id] = {
            deferred: Q.defer(),
            thumbPath: '',
            imagePath: ''
          };
          promises.push(params.deferred.promise);
          console.log(browserstackUrl);
          superagent.post(browserstackUrl)
          .send({

          })
          .end(function(error, response) {
            error = error || response.error;
            if (error) {
              delete requests[id];
              params.deferred.reject(error);
            }
            console.log(response.body);
          });
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
    server.close(callback);
  };
}
module.exports = ScreenshotServer;