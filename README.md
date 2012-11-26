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

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [grunt][grunt].

## License
Copyright (c) 2012 Peter Halliday  
Licensed under the MIT license.
