'use strict';

var echoServer = require('../fixtures/echoServer.js');
var rp = require('request-promise').defaults({
    transform: function (body) {
        return JSON.parse(body);
    }
});


describe('HPP', function () {

    describe('should check req.query', function () {

        before(function (done) {
            echoServer.start({}, done);
        });

        after(function () {
            echoServer.stop();
        });

        it('with two identical parameters', function () {

            return rp(echoServer.url + '/search?firstname=John&firstname=John')
                .then(function (data) {
                    expect(data).to.eql({
                        query: {
                            firstname: 'John'
                        },
                        queryPolluted: {
                            firstname: [ 'John', 'John' ]
                        }
                    });
                });

        });

        it('with two same parameters but different value', function () {

            return rp(echoServer.url + '/search?firstname=John&firstname=Alice')
                .then(function (data) {
                    expect(data).to.eql({
                        query: {
                            firstname: 'John'
                        },
                        queryPolluted: {
                            firstname: [ 'John', 'Alice' ]
                        }
                    });
                });

        });

        it('with mixed parameters', function () {

            return rp(echoServer.url + '/search?title=PhD&firstname=John&firstname=Alice&age=40')
                .then(function (data) {
                    expect(data).to.eql({
                        query: {
                            title: 'PhD',
                            firstname: 'John',
                            age: '40'
                        },
                        queryPolluted: {
                            firstname: [ 'John', 'Alice' ]
                        }
                    });
                });

        });

        it('without any pollution', function () {

            return rp(echoServer.url + '/search?title=PhD&firstname=Alice&age=40')
                .then(function (data) {
                    expect(data).to.eql({
                        query: {
                            title: 'PhD',
                            firstname: 'Alice',
                            age: '40'
                        },
                        queryPolluted: {
                        }
                    });
                });

        });

        it('with no query', function () {

            return rp(echoServer.url + '/search')
                .then(function (data) {
                    expect(data).to.eql({
                        query: {
                        },
                        queryPolluted: {
                        }
                    });
                });

        });

        it('with mixed parameters but checkQuery = false', function (done) {

            echoServer.start({ hpp: { checkQuery: false } }, function () {

                rp(echoServer.url + '/search?title=PhD&firstname=John&firstname=Alice&age=40')
                    .then(function (data) {
                        expect(data).to.eql({
                            query: {
                                title: 'PhD',
                                firstname: [ 'John', 'Alice' ],
                                age: '40'
                            }
                        });
                        done();
                    })
                    .catch(done);

            });

        });

    });

});
