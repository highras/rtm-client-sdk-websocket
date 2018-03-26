'use strict'

let client = null;

function test(endpoint, pid, token, from, to){
    from = new Int64BE(from);
    to = new Int64BE(to);

    client = new RTMClient({ 
        dispatch: endpoint,
        uid: from,
        token: token,
        autoReconnect: false,
        connectionTimeout: 10 * 1000,
        pid: pid,
        version: undefined,
        recvUnreadMsgStatus: false,
        ssl: false
    });

    client.on('error', (err) => {
        console.error(err);
    });

    client.login(null, false);


    client.on('login', (data) => {
        console.log('login with ' + data.endpoint + '\n\n');

        //send to server
        let step = 2;
        let index = 0;

        let t = (fn, name) => {
            setTimeout(()=>{
                var cb = function(err, data){
                    if (err){
                        console.error('\n[ERR] ' + name + ':\n', err)
                    }
                    if (data){
                        console.log('\n[DATA] ' + name + ':\n', data);
                    }
                };
                fn(name, cb);
            }, index * 1000 * step);

            if (name){
                index++;
            }
        }

        let tos = [to, new Int64BE(0, 778877)];
        let gid = new Int64BE(0, 999999);
        let rid = new Int64BE(0, 666666);
        let friends = [to, new Int64BE(0, 778877)];
        let fuid = to;
        let lat = 39239.1123;
        let lng = 69394.4850;
        
        t((name, cb) => {
            console.log('---------------begin!-----------------')
        });
        
        t((name, cb) => {
            client[name].call(client, to, 8, 'hello !', '', cb);
        }, 'sendMessage');

        t((name, cb) => {
            client[name].call(client, tos, 8, 'hello !', '', cb);
        }, 'sendMessages');

        t((name, cb) => {
            client[name].call(client, gid, 8, 'hello !', '', cb);
        }, 'sendGroupMessage');

        t((name, cb) => {
            client[name].call(client, rid, 8, 'hello !', '', cb);
        }, 'sendRoomMessage');
        
        t((name, cb) => {
            client[name].call(client, { key: 'test' }, cb);
        }, 'addVariables');

        t((name, cb) => {
            client[name].call(client, friends, cb);
        }, 'addFriends');

        t((name, cb) => {
            client[name].call(client, [new Int64BE(0, 778899)], cb);
        }, 'deleteFriends');

        t((name, cb) => {
            client[name].call(client, cb);
        }, 'getFriends');

        t((name, cb) => {
            client[name].call(client, gid, [from, to], cb);
        }, 'addGroupMembers');

        t((name, cb) => {
            client[name].call(client, gid, [to], cb);
        }, 'deleteGroupMembers');

        t((name, cb) => {
            client[name].call(client, gid, cb);
        }, 'getGroupMembers');

        t((name, cb) => {
            client[name].call(client, cb);
        }, 'getUserGroups');

        t((name, cb) => {
            client[name].call(client, rid, cb);
        }, 'enterRoom');

        t((name, cb) => {
            client[name].call(client, rid, cb);
        }, 'leaveRoom');

        t((name, cb) => {
            client[name].call(client, cb);
        }, 'getUserRooms');

        t((name, cb) => {
            client[name].call(client, tos, cb);
        }, 'getOnlineUsers');

        t((name, cb) => {
            client[name].call(client, cb);
        }, 'checkUnreadMessage');

        t((name, cb) => {
            client[name].call(client, gid, 10, false, 0, 0, 0, undefined, cb);
        }, 'getGroupMessage');

        t((name, cb) => {
            client[name].call(client, rid, 10, false, 0, 0, 0, undefined, cb);
        }, 'getRoomMessage');

        t((name, cb) => {
            client[name].call(client, 10, false, 0, 0, 0, undefined, cb);
        }, 'getBroadcastMessage');

        t((name, cb) => {
            client[name].call(client, to, 10, 0, false, 0, 0, 0, undefined, cb);
        }, 'getP2PMessage');

        t((name, cb) => {
            client[name].call(client, 'IOS', 'iphone6s', 'test device token', cb);
        }, 'addDevice');

        t((name, cb) => {
            client[name].call(client, 'en', cb);
        }, 'setTranslationLanguage');

        t((name, cb) => {
            client[name].call(client, '你好!', undefined, 'en', cb);
        }, 'translate');

        t((name, cb) => {
            client[name].call(client, 'test-user', cb);
        }, 'setPushName');

        t((name, cb) => {
            client[name].call(client, cb);
        }, 'getPushName');

        t((name, cb) => {
            client[name].call(client, lat, lng, cb);
        }, 'setGeo');

        t((name, cb) => {
            client[name].call(client, cb);
        }, 'getGeo');

        t((name, cb) => {
            client[name].call(client, [from, to], cb);
        }, 'getGeos');

        t((name, cb) => {
            console.log('---------------(' + index + ')end!-----------------');
        });

        //receive from server
        let pushName = data.services.recvMessage;
        data.processor.on(pushName, (data) => {
            console.log('\n[PUSH] ' + pushName + ':\n', data);
        });
    });
}