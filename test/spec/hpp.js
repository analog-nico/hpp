'use strict';

var echoServer = require('../fixtures/echoServer.js');
var rp = require('request-promise').defaults({
    transform: function (body) {
        return JSON.parse(body);
    }
});


describe('HPP', function () {

    describe('should validate the options', function () {

        before(function (done) {
            echoServer.start({}, done);
        });

        after(function () {
            echoServer.stop();
        });

        it('by turning off the whitelist for invalid type', function (done) {

            echoServer.start({ hpp: { whitelist: { length: 1, get 0() { throw new Error('Whitelist not deactivated!'); } } } }, function () {

                rp(echoServer.url + '/search?title=PhD&firstname=John&firstname=Alice&age=40')
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
                        done();
                    })
                    .catch(done);

            });

        });

        it('by removing non-string elements in the whitelist array', function (done) {

            echoServer.start({ hpp: { whitelist: [ 'firstname', 0, 'age' ] } }, function () {

                rp(echoServer.url + '/search?title=PhD&firstname=John&firstname=Alice&age=40&age=41&0=element1&0=element2')
                    .then(function (data) {
                        expect(data).to.eql({
                            query: {
                                title: 'PhD',
                                firstname: [ 'John', 'Alice' ],
                                age: [ '40', '41' ],
                                0: 'element1'
                            },
                            queryPolluted: {
                                0: [ 'element1', 'element2' ]
                            },
                            body: {}
                        });
                        done();
                    })
                    .catch(done);

            });

        });

    });

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

        it('with a whitelist containing one parameter', function (done) {

            echoServer.start({ hpp: { whitelist: 'firstname' } }, function () {

                rp(echoServer.url + '/search?title=PhD&firstname=John&firstname=Alice&age=40&age=41')
                    .then(function (data) {
                        expect(data).to.eql({
                            query: {
                                title: 'PhD',
                                firstname: [ 'John', 'Alice' ],
                                age: '40'
                            },
                            queryPolluted: {
                                age: [ '40', '41' ]
                            },
                            body: {}
                        });
                        done();
                    })
                    .catch(done);

            });

        });

        it('with a whitelist containing two parameters', function (done) {

            echoServer.start({ hpp: { whitelist: [ 'firstname', 'title' ] } }, function () {

                rp(echoServer.url + '/search?title=PhD&firstname=John&firstname=Alice&age=40&age=41&title=MSC')
                    .then(function (data) {
                        expect(data).to.eql({
                            query: {
                                title: [ 'PhD', 'MSC' ],
                                firstname: [ 'John', 'Alice' ],
                                age: '40'
                            },
                            queryPolluted: {
                                age: [ '40', '41' ]
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

        it('with no body parser', function (done) {

            echoServer.start({ bodyParser: false }, function () {

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
                            queryPolluted: {}
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

        it('with a whitelist containing one parameter', function (done) {

            echoServer.start({ hpp: { whitelist: 'firstname' } }, function () {

                rp.post({
                        uri: echoServer.url + '/search',
                        body: 'title=PhD&firstname=John&firstname=Alice&age=40&age=41',
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
                            },
                            bodyPolluted: {
                                age: [ '40', '41' ]
                            }
                        });
                        done();
                    })
                    .catch(done);

            });

        });

        it('with a whitelist containing two parameters', function (done) {

            echoServer.start({ hpp: { whitelist: [ 'firstname', 'title' ] } }, function () {

                rp.post({
                        uri: echoServer.url + '/search',
                        body: 'title=PhD&firstname=John&firstname=Alice&age=40&age=41&title=MSC',
                        headers: {
                            'content-type': 'application/x-www-form-urlencoded'
                        }
                    })
                    .then(function (data) {
                        expect(data).to.eql({
                            query: {},
                            queryPolluted: {},
                            body: {
                                title: [ 'PhD', 'MSC' ],
                                firstname: [ 'John', 'Alice' ],
                                age: '40'
                            },
                            bodyPolluted: {
                                age: [ '40', '41' ]
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
