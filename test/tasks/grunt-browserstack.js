/*jshint loopfunc: true */

var expect = require('chai').expect;
var exec = require('child_process').exec;
var fs = require('fs');

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

var execScenario = function(scenario, callback) {
  var scenarioDir = __dirname + '/../scenarios/' + scenario;
  var child = exec('node ../grunt.js', {cwd: scenarioDir}, function(error, stdout, stderr) {
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

describe('grunt-browserstack', function() {
  it('should do something', function(done) {
    execScenario('something', function(error, stdout, stderr) {
      expect(stdout).to.match(/first/);
      expect(stdout).to.match(/Done, without errors./);
      done();
    });
  });
});