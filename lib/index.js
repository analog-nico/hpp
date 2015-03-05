'use strict';

var _ = require('lodash');

module.exports = function (options) {

    options = _.defaults(options || {}, {
        checkQuery: true,
        checkBody: true
    });

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

        if (options.checkBody && req.body) {
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
