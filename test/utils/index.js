
var exec = require('child_process').exec;
var fs = require('fs');
var path = require('path');

var mergeCoverageData = function(data) {
  // we have to reconstruct the the _$jscoverage data
  // format as it cannot be stringified to JSON with
  // the additional source property added to arrays
  if (typeof global._$jscoverage === 'undefined') {
    global._$jscoverage = {};
  }
  var jscoverage = global._$jscoverage;
  var sourceArrays = data.sourceArrays;
  var callCounts = data.callCounts;
  for (var filename in sourceArrays) {
    var dest = jscoverage[filename];
    var src = callCounts[filename];
    src.source = sourceArrays[filename];
    if (typeof dest === 'undefined') {
      jscoverage[filename] = src;
    } else {
      src.forEach(function(count, index) {
        if (count !== null) {
          dest[index] += count;
        }
      });
    }
  }
};

module.exports.execScenario = function(scenario, task, callback) {
  if (typeof task === 'function') {
    callback = task;
    task = undefined;
  }
  var scenarioDir = path.join(__dirname, '../scenarios', scenario);
  var command = 'node ' + path.join(__dirname, 'grunt.js') + (' --stack') + (task ? ' ' + task : '');
  var child = exec(command, {cwd: scenarioDir}, function(error, stdout, stderr) {
    // collect coverage data from file if it exists
    // this is because the coverage tool does not
    // really work with child processes so we are
    // giving it a helping hand
    var jscoverageFile = scenarioDir + '/jscoverage.json';
    if (fs.existsSync(jscoverageFile)) {
      mergeCoverageData(JSON.parse(fs.readFileSync(jscoverageFile)));
    }
    callback(error, stdout, stderr);
  });
};

module.exports.overrideBrowserStackCredentials = function() {
  // If the environment is set then overwrite the browserStackCredentials.json
  if (process.env.BROWSERSTACK_API_KEY) {
    fs.writeFileSync(path.join(__dirname, '../scenarios', 'browserStackCredentials.json'), JSON.stringify({
      apiKey: process.env.BROWSERSTACK_API_KEY
    }), {
      flag: 'w+'
    });
  }
}