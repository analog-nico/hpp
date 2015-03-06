'use strict';

var _ = require('lodash');
var typeis = require('type-is');


module.exports = function (options) {

    options = _.defaults(options || {}, {
        checkQuery: true,
        checkBody: true,
        checkBodyOnlyForContentType: 'urlencoded'
    });

    function correctContentType(req) {
        return typeis(req, options.checkBodyOnlyForContentType);
    }

    return function (req, res, next) {

        if (options.checkQuery && req.query) {
            req.queryPolluted = {};

            _.forEach(_.keys(req.query), function (param) {
                if (!_.isArray(req.query[param])) {
                    return;
                }

                req.queryPolluted[param] = req.query[param];
                req.query[param] = req.query[param][0];

            });
        }

        if (options.checkBody && req.body && correctContentType(req)) {
            req.bodyPolluted = {};

            _.forEach(_.keys(req.body), function (param) {

                if (!_.isArray(req.body[param])) {
                    return;
                }

                req.bodyPolluted[param] = req.body[param];
                req.body[param] = req.body[param][0];

            });

        }

        next();

    };

};
