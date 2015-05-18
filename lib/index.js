'use strict';

var _ = require('lodash');
var typeis = require('type-is');


module.exports = function (options) {

    options = _.defaults(options || {}, {
        checkQuery: true,
        checkBody: true,
        checkBodyOnlyForContentType: 'urlencoded',
        whitelist: null
    });

    if (_.isString(options.whitelist)) {
        options.whitelist = [ options.whitelist ];
    }

    if (!_.isNull(options.whitelist) && !_.isArray(options.whitelist)) {
        console.error('[HPP] Please pass either a string or an array to "options.whitelist". Deactivated the whitelist!');
        options.whitelist = null;
    }

    if (_.isArray(options.whitelist)) {
        for ( var w = options.whitelist.length-1; w >= 0; w-=1 ) {
            if (!_.isString(options.whitelist[w])) {
                console.error('[HPP] Please pass only strings into the "options.whitelist" array. Removed the entry <' + String(options.whitelist[w]) + '>!');
                options.whitelist.splice(w, 1);
            }
        }
    }


    function correctContentType(req) {
        return typeis(req, options.checkBodyOnlyForContentType);
    }

    function fnPutAsideIn(requestPart) {

        var polluted = requestPart + 'Polluted';

        return function putAside(req) {

            // Put aside only once in case multiple HPP middlewares are used
            if (_.isUndefined(req[polluted])) {

                req[polluted] = {};

                var parameters = _.keys(req[requestPart]);
                for (var i = 0; i < parameters.length; i += 1) {

                    var param = parameters[i];

                    if (!_.isArray(req[requestPart][param])) {
                        continue;
                    }

                    // Put aside
                    req[polluted][param] = req[requestPart][param];
                    // Select the first parameter value
                    req[requestPart][param] = req[requestPart][param][0];

                }

            }

            // Processed seperately to allow multiple whitelists from multiple HPP middlewares as well as for performance reasons
            if (options.whitelist) {

                for ( var k = 0; k < options.whitelist.length; k+=1 ) {

                    var whitelistedParam = options.whitelist[k];

                    if (req[polluted][whitelistedParam]) {
                        // Put back
                        req[requestPart][whitelistedParam] = req[polluted][whitelistedParam];
                        delete req[polluted][whitelistedParam];
                    }

                }

            }

        };

    }

    var putAsideInQuery = fnPutAsideIn('query');
    var putAsideInBody = fnPutAsideIn('body');


    return function hppMiddleware(req, res, next) {

        if (options.checkQuery && req.query) {
            putAsideInQuery(req);
        }

        if (options.checkBody && req.body && correctContentType(req)) {
            putAsideInBody(req);
        }

        next();

    };

};
