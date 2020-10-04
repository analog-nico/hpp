'use strict'

var express = require('express')
var http = require('http')
var hpp = require('../../lib/index.js')
var _ = require('lodash')

var server = null

module.exports = {
  start: function (options, done) {
    options = options || {}

    this.stop()

    var app = express()
    server = http.createServer(app)

    if (options.bodyParser !== false) {
      app.use(express.json())
      app.use(express.urlencoded({ extended: true }))
    }

    if (_.isArray(options.hpp)) {
      _.forEach(options.hpp, function (settings) {
        if (settings.path) {
          app.use(settings.path, hpp(settings.options))
        } else {
          app.use(hpp(settings.options))
        }
      })
    } else {
      app.use(hpp(options.hpp))
    }

    app.use(function (req, res, next) {
      res.json({
        query: req.query,
        queryPolluted: req.queryPolluted,
        body: req.body,
        bodyPolluted: req.bodyPolluted
      })
    })

    server.listen(4000, function () {
      done()
    })
  },
  stop: function () {
    if (server) {
      server.close()
      server = null
    }
  },
  url: 'http://localhost:4000'
}
