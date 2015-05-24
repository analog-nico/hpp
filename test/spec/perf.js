'use strict';

var hpp = require('../../lib/index.js');


describe('Performance', function () {

    it('for checking body with two middleware including whitelist', function () {

        var firstMiddleware = hpp();
        var secondMiddleware = hpp({
            whitelist: [ 'filter' ]
        });

        var simulateRequest = function (req) {
            firstMiddleware(req, {}, function () {
                secondMiddleware(req, {}, function () {});
            });
        };

        var timeStart = (new Date()).getTime();

        var req;
        var iterations = 100000;

        for ( var i = 0; i < iterations; i+=1 ) {

            req = {
                query: {
                    name: 'John',
                    last: 'Doe',
                    age: 33,
                    filter: [ 'a', 'b' ]
                }
            };

            simulateRequest(req);

        }

        var timeEnd = (new Date()).getTime();

        expect(req).to.eql({
            query: {
                name: 'John',
                last: 'Doe',
                age: 33,
                filter: [ 'a', 'b' ]
            },
            queryPolluted: {}
        });

        console.log('Processing a single requests took ' + ((timeEnd - timeStart) / iterations) + 'ms');

    });

});
