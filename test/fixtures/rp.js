'use strict';

// Minimal fetch-based replacement for the deprecated `request-promise` usage in the spec.
// The spec uses:
//   - rp(url)                      -> GET, resolve to parsed JSON
//   - rp.post({uri, body, headers}) -> POST, resolve to parsed JSON
//   - rp.defaults({transform})      -> the transform parsed JSON; we parse JSON by default
function request(method, uri, opts) {
    opts = opts || {};
    var init = { method: method, headers: opts.headers || {} };
    if (opts.body !== undefined) {
        init.body = opts.body;
    }
    return fetch(uri, init).then(function (res) {
        if (!res.ok) {
            var err = new Error('HTTP ' + res.status);
            err.statusCode = res.status;
            throw err;
        }
        return res.json();
    });
}

function rp(uri) {
    return request('GET', uri);
}

rp.post = function (opts) {
    return request('POST', opts.uri, opts);
};

rp.defaults = function () {
    return rp;
};

module.exports = rp;
