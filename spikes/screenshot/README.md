Screenshot spike
================

- start the server

```
$ node test.js
```

- start the tunnel

```
$ ./tunnel.sh YOUR_APIKEY
```

- submit a screenshot request

```
$ ./screenshot.sh YOUR_USERNAME YOUR_APIKEY
```

- The request should be accepted and you should get a job ID
- When complete the server should print out the data posted to the callback url
- You can check the status of the job using

```
$ ./check.sh YOUR_USERNAME YOUR_APIKEY JOB_ID
```