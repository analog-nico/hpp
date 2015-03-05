'use strict';

module.exports = function (options) {

    options = options || {};

    return function (req, res, next) {
        next();
    };

};
