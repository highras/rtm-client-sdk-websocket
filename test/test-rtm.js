'use strict'

let client = null;

function test(endpoint, pid, token, from, to){
    from = new Int64BE(from);
    to = new Int64BE(to);

    let step = 2;
    let index = 0;
    let t = function(fn, name){
        setTimeout(function(){
            var cb = function(err, data){
                if (err){
                    console.error('\n[ERR] ' + name + ':\n', err.message);
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
    let timeout = 10 * 1000;
        

    client = new RTMClient({
        dispatch: endpoint,
        uid: from,
        token: token,
        autoReconnect: true,
        connectionTimeout: 10 * 1000,
        pid: pid,
        version: undefined,
        recvUnreadMsgStatus: false,
        ssl: true,
        proxyEndpoint: 'highras.ifunplus.cn:13550'
        // proxyEndpoint: 'infra-dev.ifunplus.cn:13550'
    });

    client.on('error', function(err){
        console.error(err);
    });

    client.on('close', function(){
        console.log('closed!');
    });

    client.login();

    //receive from server
    let pushName = client.rtmConfig.SERVER_PUSH.recvMessage;
    client.processor.on(pushName, function(data){
        console.log('\n[PUSH] ' + pushName + ':\n', data);
    });

    pushName = client.rtmConfig.SERVER_PUSH.recvPing;
    client.processor.on(pushName, function(data){
        console.log('\n[PUSH] ' + pushName + ':\n', data);
    });

    //send to server
    client.on('login', function(data){
        if (data.error){
            console.error(data.error);
            return;
        }

        index = 0;
        console.log('login with ' + data.endpoint + '\n\n');

        t(function(name, cb){
            console.log('---------------begin!-----------------')
        });
        
        t(function(name, cb){
            client[name].call(client, to, 8, 'hello !', '', timeout, cb);
        }, 'sendMessage');

        t(function(name, cb){
            client[name].call(client, tos, 8, 'hello !', '', timeout, cb);
        }, 'sendMessages');

        t(function(name, cb){
            client[name].call(client, gid, 8, 'hello !', '', timeout, cb);
        }, 'sendGroupMessage');

        t(function(name, cb){
            client[name].call(client, rid, 8, 'hello !', '', timeout, cb);
        }, 'sendRoomMessage');
        
        t(function(name, cb){
            client[name].call(client, { key: 'test' }, timeout, cb);
        }, 'addVariables');

        t(function(name, cb){
            client[name].call(client, friends, timeout, cb);
        }, 'addFriends');

        t(function(name, cb){
            client[name].call(client, [new Int64BE(0, 778899)], timeout, cb);
        }, 'deleteFriends');

        t(function(name, cb){
            client[name].call(client, timeout, cb);
        }, 'getFriends');

        t(function(name, cb){
            client[name].call(client, gid, [from, to], timeout, cb);
        }, 'addGroupMembers');

        t(function(name, cb){
            client[name].call(client, gid, [to], timeout, cb);
        }, 'deleteGroupMembers');

        t(function(name, cb){
            client[name].call(client, gid, timeout, cb);
        }, 'getGroupMembers');

        t(function(name, cb){
            client[name].call(client, timeout, cb);
        }, 'getUserGroups');

        t(function(name, cb){
            client[name].call(client, rid, timeout, cb);
        }, 'enterRoom');

        t(function(name, cb){
            client[name].call(client, rid, timeout, cb);
        }, 'leaveRoom');

        t(function(name, cb){
            client[name].call(client, timeout, cb);
        }, 'getUserRooms');

        t(function(name, cb){
            client[name].call(client, tos, timeout, cb);
        }, 'getOnlineUsers');

        t(function(name, cb){
            client[name].call(client, timeout, cb);
        }, 'checkUnreadMessage');

        t(function(name, cb){
            client[name].call(client, gid, 10, false, 0, 0, 0, undefined, timeout, cb);
        }, 'getGroupMessage');

        t(function(name, cb){
            client[name].call(client, rid, 10, false, 0, 0, 0, undefined, timeout, cb);
        }, 'getRoomMessage');

        t(function(name, cb){
            client[name].call(client, 10, false, 0, 0, 0, undefined, timeout, cb);
        }, 'getBroadcastMessage');

        t(function(name, cb){
            client[name].call(client, to, 10, 0, false, 0, 0, 0, undefined, timeout, cb);
        }, 'getP2PMessage');

        t(function(name, cb){
            client[name].call(client, 'app-info', 'device-token', timeout, cb);
        }, 'addDevice');

        t(function(name, cb){
            client[name].call(client, 'device-token', timeout, cb);
        }, 'removeDevice');

        t(function(name, cb){
            client[name].call(client, 'en', timeout, cb);
        }, 'setTranslationLanguage');

        t(function(name, cb){
            client[name].call(client, '你好!', undefined, 'en', timeout, cb);
        }, 'translate');

        t(function(name, cb){
            client[name].call(client, lat, lng, timeout, cb);
        }, 'setGeo');

        t(function(name, cb){
            client[name].call(client, timeout, cb);
        }, 'getGeo');

        t(function(name, cb){
            client[name].call(client, [from, to], timeout, cb);
        }, 'getGeos');

        t(function(name, cb){
            console.log('---------------(' + index + ')end!-----------------');
        });
    });
}