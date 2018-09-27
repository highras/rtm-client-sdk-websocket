'use strict'

function test(endpoint, pid, token, from, to) {

    // case 1
    baseTest(endpoint, pid, token, from, to);

    // case 2
    // asyncStressTest();
}

function baseTest(endpoint, pid, token, from, to) {

    console.log('connect to dispatch: ', endpoint);

    let tester = TestCase({
        dispatch: endpoint,
        uid: from,
        token: token,
        autoReconnect: true,
        connectionTimeout: 20 * 1000,
        pid: pid,
        version: undefined,
        recvUnreadMsgStatus: false,
        ssl: true,
        // proxyEndpoint: 'highras.ifunplus.cn:13556'
        proxyEndpoint: 'infra-dev.ifunplus.cn:13556'
    }, from, to);
}

function asyncStressTest() {

    let tester = AsyncStressTester({
        dispatch: '',
        uid: 1,
        token: '',
        autoReconnect: true,
        connectionTimeout: 30 * 1000,
        pid: 0,
        version: undefined,
        recvUnreadMsgStatus: false,
        ssl: true,
        proxyEndpoint: 'infra-dev.ifunplus.cn:13556'
    }, '10.63.2.47:13013');

    tester.buildTesters(1, 150);

    tester.launch();
    tester.showStatistics();
}