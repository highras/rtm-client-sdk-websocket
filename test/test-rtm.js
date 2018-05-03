'use strict'

function test(endpoint, pid, token, from, to) {

    // case 1
    baseTest(endpoint, pid, token, from, to);

    // case 2
    // TODO
}

function baseTest(endpoint, pid, token, from, to) {

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
        proxyEndpoint: 'highras.ifunplus.cn:13550'
    }, from, to);
}

function asyncStressTest() {

    let tester = AsyncStressTester({
        dispatch: '',
        uid: 1,
        token: '',
        autoReconnect: true,
        connectionTimeout: 20 * 1000,
        pid: 0,
        version: undefined,
        recvUnreadMsgStatus: false,
        ssl: true,
        proxyEndpoint: 'infra-dev.ifunplus.cn:13550'
    }, '35.167.185.139:13013');

    tester.buildTesters(1, 1);

    tester.launch();
    tester.showStatistics();
}