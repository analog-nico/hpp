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
                        },
                        body: {}
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
                        },
                        body: {}
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
                        },
                        body: {}
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
                        },
                        body: {}
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
                        },
                        body: {}
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
                            },
                            body: {}
                        });
                        done();
                    })
                    .catch(done);

            });

        });

    });

    describe('should check req.body', function () {

        before(function (done) {
            echoServer.start({}, done);
        });

        after(function () {
            echoServer.stop();
        });

        it('with two identical parameters', function () {

            return rp.post({
                    uri: echoServer.url + '/search',
                    body: 'firstname=John&firstname=John',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(function (data) {
                    expect(data).to.eql({
                        query: {},
                        queryPolluted: {},
                        body: {
                            firstname: 'John'
                        },
                        bodyPolluted: {
                            firstname: [ 'John', 'John' ]
                        }
                    });
                });

        });

        it('with two same parameters but different value', function () {

            return rp.post({
                    uri: echoServer.url + '/search',
                    body: 'firstname=John&firstname=Alice',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(function (data) {
                    expect(data).to.eql({
                        query: {},
                        queryPolluted: {},
                        body: {
                            firstname: 'John'
                        },
                        bodyPolluted: {
                            firstname: [ 'John', 'Alice' ]
                        }
                    });
                });

        });

        it('with mixed parameters', function () {

            return rp.post({
                    uri: echoServer.url + '/search',
                    body: 'title=PhD&firstname=John&firstname=Alice&age=40',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(function (data) {
                    expect(data).to.eql({
                        query: {},
                        queryPolluted: {},
                        body: {
                            title: 'PhD',
                            firstname: 'John',
                            age: '40'
                        },
                        bodyPolluted: {
                            firstname: [ 'John', 'Alice' ]
                        }
                    });
                });

        });

        it('without any pollution', function () {

            return rp.post({
                    uri: echoServer.url + '/search',
                    body: 'title=PhD&firstname=Alice&age=40',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(function (data) {
                    expect(data).to.eql({
                        query: {},
                        queryPolluted: {},
                        body: {
                            title: 'PhD',
                            firstname: 'Alice',
                            age: '40'
                        },
                        bodyPolluted: {
                        }
                    });
                });

        });

        it('with no body', function () {

            return rp.post({
                    uri: echoServer.url + '/search',
                    body: '',
                    headers: {
                        'content-type': 'application/x-www-form-urlencoded'
                    }
                })
                .then(function (data) {
                    expect(data).to.eql({
                        query: {},
                        queryPolluted: {},
                        body: {
                        },
                        bodyPolluted: {
                        }
                    });
                });

        });

        it('with mixed parameters but checkBody = false', function (done) {

            echoServer.start({ hpp: { checkBody: false } }, function () {

                rp.post({
                        uri: echoServer.url + '/search',
                        body: 'title=PhD&firstname=John&firstname=Alice&age=40',
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded'
                        }
                    })
                    .then(function (data) {
                        expect(data).to.eql({
                            query: {},
                            queryPolluted: {},
                            body: {
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

        it('but only for application/x-www-form-urlencoded', function (done) {

            echoServer.start({}, function () {

                rp.post({
                        uri: echoServer.url + '/search',
                        body: JSON.stringify({
                            title: 'PhD',
                            firstname: ['John', 'Alice'],
                            age: 40
                        }),
                        headers: {
                            'content-type': 'application/json'
                        }
                    })
                    .then(function (data) {
                        expect(data).to.eql({
                            query: {},
                            queryPolluted: {},
                            body: {
                                title: 'PhD',
                                firstname: [ 'John', 'Alice' ],
                                age: 40
                            }
                        });
                        done();
                    })
                    .catch(done);

            });

        });

    });

    describe('should check both', function () {

        before(function (done) {
            echoServer.start({}, done);
        });

        after(function () {
            echoServer.stop();
        });

        it('with two identical parameters', function () {

            return rp.post({
                uri: echoServer.url + '/search?title=Prof&firstname=Alice&firstname=John&age=41',
                body: 'title=PhD&firstname=John&firstname=Alice&age=40',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded'
                }
            })
                .then(function (data) {
                    expect(data).to.eql({
                        query: {
                            title: 'Prof',
                            firstname: 'Alice',
                            age: '41'
                        },
                        queryPolluted: {
                            firstname: ['Alice', 'John']
                        },
                        body: {
                            title: 'PhD',
                            firstname: 'John',
                            age: '40'
                        },
                        bodyPolluted: {
                            firstname: ['John', 'Alice']
                        }
                    });
                });

        });

    });

});
