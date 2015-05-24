'use strict';

var isArray = Array.isArray;

var _ = require('lodash');
var defaults = _.defaults;

var typeis = require('type-is');

/**
 * @public
 * @param {object} options
 * @param {boolean} [options.checkQuery]
 * @param {boolean} [options.checkBody]
 * @param {string} [options.checkBodyOnlyForContentType]
 * @param {string[]|string} [options.whitelist]
 * @return {function}
 */
module.exports = function (options) {

    options = defaults(options || {}, {
        checkQuery: true,
        checkBody: true,
        checkBodyOnlyForContentType: 'urlencoded',
        whitelist: null
    });

    if (typeof options.whitelist === 'string') {
        options.whitelist = [options.whitelist];
    }

    if (options.whitelist !== null && !isArray(options.whitelist)) {
        options.whitelist = null;
    }

    if (isArray(options.whitelist)) {

        options.whitelist = options.whitelist.filter(function (elem) {

            if (typeof elem !== 'string') {

                var whiteListTypeErrorMsg = [
                    '[HPP] ',
                    'Please pass only strings into the "options.whitelist" array. ',
                    'Removed the entry <',
                    String(elem),
                    '>!'
                ].join('');

                console.error(whiteListTypeErrorMsg);

                return false;
            }

            return true;
        });

    }

    /**
     * @private
     * @param {object} req
     * @return {string}
     */
    function _correctContentType(req) {
        return typeis(req, options.checkBodyOnlyForContentType);
    }

    /**
     * @private
     * @param {string} requestPart e.g 'body' or 'query'
     * @param {object} req
     */
    function _putAside(requestPart, req) {
        var whitelist = options.whitelist;

        var polluted = requestPart + 'Polluted';

        var reqPart = req[requestPart];
        var reqPolluted = req[polluted];

        // Put aside only once in case multiple HPP middlewares are used
        if (typeof reqPolluted === 'undefined') {

            reqPolluted = req[polluted] = {};

            var parameters = Object.keys(reqPart);

            var paramKey;
            var paramValue;

            for (var i = 0, parametersLen = parameters.length; i < parametersLen; i += 1) {

                paramKey = parameters[i];
                paramValue = reqPart[paramKey];

                if (!isArray(paramValue)) {
                    continue;
                }

                // Put aside
                reqPolluted[paramKey] = paramValue;
                // Select the first parameter value
                reqPart[paramKey] = paramValue[0];

            }

        }

        // Processed seperately to allow multiple whitelists from multiple HPP middlewares as well as
        // for performance reasons
        if (isArray(whitelist)) {

            var whitelistedParam;

            for (var k = 0, whitelistLen = whitelist.length; k < whitelistLen; k += 1) {

                whitelistedParam = whitelist[k];

                if (reqPolluted[whitelistedParam]) {
                    // Put back
                    reqPart[whitelistedParam] = reqPolluted[whitelistedParam];
                    delete reqPolluted[whitelistedParam];
                }

            }

        }

    }

    /**
     * @public
     * @param {object} req
     * @param {object} [req.query]
     * @param {object} [req.body]
     * @param {object} res
     * @param {function} next
     */
    return function hppMiddleware(req, res, next) {

        if (options.checkQuery && req.query) {
            _putAside('query', req);
        }

        if (options.checkBody && req.body && _correctContentType(req)) {
            _putAside('body', req);
        }

        next();

    };

};

