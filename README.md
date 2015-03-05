# HPP

[Express](http://expressjs.com)/Connect middleware to protect against HTTP Parameter Pollution attacks

[![Build Status](https://travis-ci.org/analog-nico/hpp.svg?branch=master)](https://travis-ci.org/analog-nico/hpp) [![Coverage Status](https://coveralls.io/repos/analog-nico/hpp/badge.png)](https://coveralls.io/r/analog-nico/hpp?branch=master) [![Dependency Status](https://david-dm.org/analog-nico/hpp.svg)](https://david-dm.org/analog-nico/hpp)

## Why?

GET /search?**firstname**=John&**firstname**=John

``` js
req.query.firstname // => ???
```

It is `[ "John", "John" ]` !

Check out [these excellent slides](https://speakerdeck.com/ckarande/top-overlooked-security-threats-to-node-dot-js-web-applications?slide=48).

## Installation

[![NPM Stats](https://nodei.co/npm/hpp.png?downloads=true)](https://npmjs.org/package/hpp)

This is a module for node.js and io.js and is installed via npm:

``` bash
npm install hpp --save
```

## Getting Started

Description forthcoming.

## Contributing

To set up your development environment for HPP:

1. Clone this repo to your desktop,
2. in the shell `cd` to the main folder,
3. hit `npm install`,
4. hit `npm install gulp -g` if you haven't installed gulp globally yet, and
5. run `gulp dev`. (Or run `node ./node_modules/.bin/gulp dev` if you don't want to install gulp globally.)

`gulp dev` watches all source files and if you save some changes it will lint the code and execute all tests. The test coverage report can be viewed from `./coverage/lcov-report/index.html`.

If you want to debug a test you should use `gulp test-without-coverage` to run all tests without obscuring the code by the test coverage instrumentation.

## Change History

- v0.0.1 (Forthcoming)
    - Initial version

## License (ISC)

In case you never heard about the [ISC license](http://en.wikipedia.org/wiki/ISC_license) it is functionally equivalent to the MIT license.

See the [LICENSE file](LICENSE) for details.