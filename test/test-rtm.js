'use strict'

function baseTest(endpoint, pid, token, from, to) {

    let tester = TestCase({
        endpoint: endpoint,
        //ssl_endpoint: endpoint,
        uid: from,
        token: token,
        autoReconnect: true,
        connectionTimeout: 10 * 1000,
        pid: pid,
        attrs: { user: 'test user attrs' }
    }, from, to);

    tester.test();
    return tester;
}

function asyncStressTest() {

    let tester = AsyncStressTester({
        dispatch: '',
        uid: 1,
        token: '',
        autoReconnect: true,
        connectionTimeout: 60 * 1000,
        pid: 0,
        //ssl: true,
        //proxyEndpoint: 'rtm-intl-frontgate.ilivedata.com:13556'
    }, '10.63.2.47:13013');

    tester.buildTesters(1, 150);

    tester.launch();
    tester.showStatistics();
}