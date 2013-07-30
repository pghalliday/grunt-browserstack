var http = require('http');

server = http.createServer(function(request, response) {
  response.end('Hello, world!');
});

server.listen(8000, function(error) {
  if (error) {
    console.log(error);
  } else {
    console.log('Server listening on port 8000');
  }
});