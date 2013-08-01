var Server = require('./Server');
var port = process.argv[2];
var apiKey = process.argv[3];
server = new Server({
  port: port,
  apiKey: apiKey
});

server.start(function(error) {
  if (error) {
    console.log(error);
  } else {
    console.log('BrowserStack screenshot server listening on port ' + port);
  }
});