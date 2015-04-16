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

            var queryParams = _.keys(req.query);
            for ( var q = 0; q < queryParams.length; q+=1 ) {

                if (!_.isArray(req.query[queryParams[q]])) {
                    continue;
                }

                req.queryPolluted[queryParams[q]] = req.query[queryParams[q]];
                req.query[queryParams[q]] = req.query[queryParams[q]][0];

            }
        }

        if (options.checkBody && req.body && correctContentType(req)) {
            req.bodyPolluted = {};

            var bodyParams = _.keys(req.body);
            for ( var b = 0; b < bodyParams.length; b+=1 ) {

                if (!_.isArray(req.body[bodyParams[b]])) {
                    continue;
                }

                req.bodyPolluted[bodyParams[b]] = req.body[bodyParams[b]];
                req.body[bodyParams[b]] = req.body[bodyParams[b]][0];

            }

        }

        next();

    };

};
