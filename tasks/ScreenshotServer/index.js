var express = require('express');
var http = require('http');

var app = express()
var server = http.createServer(app);

var port = process.argv[2];

server.listen(port, function(error) {
  if (error) {
    console.log(error);
  } else {
    console.log('BrowserStack screenshot server listening on port ' + port);
  }
});