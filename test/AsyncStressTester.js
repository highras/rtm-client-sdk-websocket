'use strict'

function AsyncStressTester(options, gate) {

    let sendCount = 0;
    let recvCount = 0;
    let recvError = 0;
    let timecost = 0;

    let testers = [];

    let opts = options;

    let incSend = function() {

        sendCount += 1;
    }
    
    let incRecv = function() {
    
        recvCount += 1;
    }
    
    let incRecvError = function() {
    
        recvError += 1;
    }
    
    let addTimecost = function(cost) {
        
        timecost += cost;
    }
    
    let doTest = function(client) {
    
        let interval = 1000 / client.qps;
        let batchCount = 1;
    
        while (interval == 0) {
    
            batchCount += 1;
            interval = 1000 * batchCount / client.qps;
        }
    
        console.log('-- single client qps: ' + client.qps + ', sleep millisecond interval: ' + interval + ', batch count: ' + batchCount);
    
        let self = this;
    
        client.on('error', function(err) {
    
            console.error(err);
        });
    
        client.on('close', function() {
    
            console.log('closed!');
        });
    
        client.on('connect', function() {
    
            let quest = buildStandardTestQuest.call(self, client.msgpack, client.msgOptions);
            setInterval(function() {
    
                let startTime = Date.now();
                
                for (let i = 0; i < batchCount; i++) {
    
                    let send_time = Date.now();
                    client.sendQuest(quest, function(err, data) { 
    
                        if (err != null) {
    
                            incRecvError();
                        }else{
    
                            incRecv();
                            let recv_time = Date.now();
                            let diff = recv_time - send_time;
                            addTimecost(diff/1000);
                        }
                    }, 10 * 1000);
    
                    incSend();
                }
            }, Math.round(interval));
        });
    
        client.connect(gate, 20 * 1000);
    }
    
    let buildStandardTestQuest = function(msgpack, msgOptions) {
    
        let arr = [];
        arr.push('first_vec');
        arr.push(4);
    
        let map = {};
        map['map1'] = 'first_map';
        map['map2'] = true;
        map['map3'] = 5;
        map['map4'] = 5.7;
        map['map5'] = '中文';
    
        let payload = {
            quest: 'one',
            int: 2,
            double: 3.3,
            boolean: true,
            ARRAY: arr,
            MAP: map 
        };
    
        return {
            flag: 1,
            method: 'two way demo',
            payload: msgpack.encode(payload, msgOptions)
        };
    }

    return {
        buildTesters: function(clientCount, totalQPS) {

            testers = [];

            let qps = totalQPS / clientCount;
            if (qps == 0) {

                qps = 1;
            }

            let remain = totalQPS - qps * clientCount;

            for (let i = 0; i < clientCount; i++) {

                let client = new Rtm.RTMClient(opts);
                client.qps = qps;
                testers.push(client);
            }

            if (remain > 0) {

                let client = new Rtm.RTMClient(opts);
                client.qps = qps;
                testers.push(client);
            }
        },
        launch: function() {

            let self = this;

            testers.forEach(function(item, index) {

                doTest.call(self, item);
            });
        },
        showStatistics: function() {

            let sendSt = sendCount;
            let recvSt = recvCount;
            let recvErrorSt = recvError;
            let timecostSt = timecost;

            let start = Date.now();

            setInterval(function() {

                let s = sendCount;
                let r = recvCount;
                let re = recvError;
                let tc = timecost;

                let ent = Date.now();
                let ds = s - sendSt;
                let dr = r - recvSt;
                let dre = re - recvErrorSt;
                let dtc = tc - timecostSt;

                sendSt = s;
                recvSt = r;
                recvErrorSt = re;
                timecostSt = tc;

                let real_time = ent - start;

                if (dr > 0) {

                    dtc = dtc / dr;
                }

                ds = Math.round(ds * 1000 / real_time);
                dr = Math.round(dr * 1000 / real_time);
                //dse = dse * 1000 * 1000 * 1000 / real_time;
                //dre = dre * 1000 * 1000 * 1000 / real_time;

                console.log('\ntime interval: ' + (real_time) + ' ms, recv error: ' + dre);
                console.log('[QPS] send: ' + ds + ', recv: ' + dr + ', per quest time cost: ' + Math.round(dtc * 1000000) + ' usec');

                start = Date.now();
            }, 3 * 1000);
        }
    }
}