var express = require('express');
var app = express();
var port = 8000;

app.get('/', function(request, response) {
  response.send('Hello, world!');
});

app.post('/callback', function(request, response) {
  console.log(request.text);
  console.log(request.body);
  response.send(201);
});

app.listen(port, function(error) {
  console.log('Server listening on port ' + port);
});