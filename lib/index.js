'use strict';

var _ = require('lodash');
var isString = _.isString;
var isArray = _.isArray;
var isUndefined = _.isUndefined;
var isNull = _.isNull;
var defaults = _.defaults;
var extend = _.extend;
var pick = _.pick;
var omit = _.omit;
var partial = _.partial;
var mapValues = _.mapValues;
var first = _.first;
var contains = _.contains;

var typeis = require('type-is');

module.exports = function (options) {

    options = defaults(options, {
        checkQuery: true,
        checkBody: true,
        checkBodyOnlyForContentType: 'urlencoded',
        whitelist: null
    });

    if (isString(options.whitelist)) {
        options.whitelist = [options.whitelist];
    }

    if (!isNull(options.whitelist) && !isArray(options.whitelist)) {
        options.whitelist = null;
    }

    if (isArray(options.whitelist)) {

        options.whitelist = options.whitelist.filter(function (elem) {
            if (!isString(elem)) {

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
     */
    function _fnPutAsideIn(requestPart) {

        var polluted = requestPart + 'Polluted';

        return function putAside(req) {

            // Put aside only once in case multiple HPP middlewares are used
            if (isUndefined(req[polluted])) {

                /**
                 * @private
                 * @param {any} value
                 * @return {any}
                 */
                var _firstIfArray = function (value) {
                    return isArray(value) ? first(value) : value;
                };

                req[polluted] = pick(req[requestPart], isArray);
                req[requestPart] = mapValues(req[requestPart], _firstIfArray);
            }

            // Processed seperately to allow multiple whitelists from multiple HPP middlewares as well as
            // for performance reasons

            var whitelist = options.whitelist;

            if (isArray(whitelist)) {

                /**
                 * @private
                 * @param {string} key object key
                 * @return {boolean} whether whitelist contains that key
                 */
                var _whitelistContainsKey = function (val, key) {
                    return contains(whitelist, key);
                };

                req[requestPart] = extend(req[requestPart], pick(req[polluted], _whitelistContainsKey));
                req[polluted] = omit(req[polluted], _whitelistContainsKey);
            }

        };

    }

    var putAsideInQuery = _fnPutAsideIn('query');
    var putAsideInBody = _fnPutAsideIn('body');

    /**
     * @public
     * @param {object} req
     * @param {object} res
     * @param {function} next
     */
    return function hppMiddleware(req, res, next) {

        if (options.checkQuery && req.query) {
            putAsideInQuery(req);
        }

        if (options.checkBody && req.body && _correctContentType(req)) {
            putAsideInBody(req);
        }

        next();

    };

};
