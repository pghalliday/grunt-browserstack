# grunt-browserstack

[BrowserStack][browserstack] tasks for grunt

## Getting Started
Install this grunt plugin next to your project's [grunt.js gruntfile][getting_started] with: `npm install grunt-browserstack`

Then add this line to your project's `grunt.js` gruntfile:

```javascript
grunt.loadNpmTasks('grunt-browserstack');
```

[grunt]: http://gruntjs.com/
[getting_started]: https://github.com/gruntjs/grunt/blob/master/docs/getting_started.md
[browserstack]: http://www.browserstack.com/

## Documentation

Exposes 3 tasks:

### browserstack_list

Lists the available browsers to the console

```javascript
browserstack_list: {
  dev: {
    username: 'USERNAME',
    password: 'PASSWORD'
  }
} 
```

### browserstack

Starts the requested workers with [BrowserStack][browserstack]. Optionally starts a BrowserStack tunnel to expose a local server to the workers.

This task does not exit untli the user presses a key at which time the workers are stopped again. Errors may occur when stopping the workers if they have timed out in the intervening period.

```javascript
browserstack: {
  dev: {
    credentials: {
      username: 'USERNAME',
      password: 'PASSWORD'
    },
    // optional tunnel configuration - if omitted a tunnel is not started
    tunnel: {
      // your BrowserStack API key
      key: 'KEY',
      // a list of hostnames and ports to expose
      hosts: [{
        name: 'HOSTNAME',
        port: PORT,
        sslFlag: 0
      }]
    },
    // required worker start configuration
    start: {
      // time to wait for workers to start running
      queueTimeout: QUEUE_TIMEOUT,
      // default URL for started workers
      url: 'URL',
      // default timeout for started workers
      timeout: TIMEOUT,
      // list of browser types to start, as returned from the list function
      browsers: [{
        os: 'OS',
        browser: 'BROWSER',
        version: 'VERSION',
        // override the default URL
        url: 'URL',
        // override the default worker timeout
        timeout: TIMEOUT
      }, {
        os: 'OS',
        browser: 'BROWSER',
        version: 'VERSION',
        // override the default URL
        url: 'URL',
        // override the default worker timeout
        timeout: TIMEOUT
      }]
    }
  }
}
```

### browserstack_clean

Stops all currently running workers for the given account. For the purposes of cleaning up orphaned workers when needed

```javascript
browserstack_clean: {
  dev: {
    username: 'USERNAME',
    password: 'PASSWORD'
  }
} 
```

## Roadmap

Major refactor is probably due

- tunnel tasks
  - `browserstackTunnelInit`
    - start browserstack tunnel
  - `browserstackTunnelUninit`
    - stop browserstack tunnel   
- test tasks
  - `browserstackTestInit`
    - start karma
    - start workers
  - `browserstackTest`
    - run tests
  - `browserstackTestUninit`
    - stop workers
    - stop karma
- screenshot tasks
  - `browserstackScreenshot`
    - start response listener
    - submit screen shot requests
    - listen for responses
    - download and store images with timestamps, etc
    - stop listener

### Usage patterns

In the below examples it is assumed that the following other tasks will be used to intialise the state of a local server to prepare for the screenshots and then cleanup afterward

- `serverInit`
- `serverUninit`

These will obviously be application specific and are not provided by the `grunt-browserstack` plugin

Also the examples use the `grunt-continue` plugin to ensure that cleanup is performed after failing tests, etc without having to use the `--force` option at the command line

```
$ npm install grunt-continue
```

```javascript
// Load the continueOn and continueOff tasks
grunt.loadNpmTasks('grunt-continue');
```

#### Development

In development you would likely want to start all the services first and then run tests or take screen shots repeatedly

```javascript
grunt.registerTask('start', [
  'browserstackTunnelInit',
  'browserstackTestInit'
]);

grunt.registerTask('default', ['browserstackTest']);

// For the screenshots you may want to start and stop the application each time
// to ensure it is serving the latest version of everything
grunt.registerTask('screenshot', [
  'serverInit',
  'browserstackScreenshot',
  'serverUninit'
]);

grunt.registerTask('stop', [
  'browserstackTestUninit',
  'browserstackTunnelUninit'
]);
```

```
# Start the tunnnel and workers and leave then running while tests
# are run and screen shots taken repeatedly
$ grunt start

...

# Run tests
$ grunt

# Take screen shots
$ grunt screenshot

...

# Stop the tunnel and workers when they are not going to be needed again for a while
$ grunt stop
```

#### Integration server

On an integration server you would likely want to start all the services run the tests, take screen shots and then clean up all in one go

```javascript
grunt.registerTask('integration', [
  'browserstackTunnelInit',
  'browserstackTestInit',
  // Stop grunt aborting if the tests fail
  // so that cleanup still happens
  'continueOn',
  'browserstackTest',
  // grunt can abort again now
  'continueOff',
  'browserstackTestUninit',
  'serverInit',
  'browserstackScreenshot',
  'serverUninit',
  'browserstackTunnelUninit'
]);
```

To run the task

```
$ grunt integration
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## License
Copyright (c) 2012 Peter Halliday  
Licensed under the MIT license.
