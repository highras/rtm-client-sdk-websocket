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
        ssl: true,
        proxyEndpoint: 'highras.ifunplus.cn:13550'
        // proxyEndpoint: 'infra-dev.ifunplus.cn:13550'
    });

    client.on('error', function(err){
        console.error(err);
    });

    client.login();


    client.on('login', function(data){
        console.log('login with ' + data.endpoint + '\n\n');

        //send to server
        let step = 2;
        let index = 0;

        let t = function(fn, name){
            setTimeout(function(){
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
        
        t(function(name, cb){
            console.log('---------------begin!-----------------')
        });
        
        t(function(name, cb){
            client[name].call(client, to, 8, 'hello !', '', cb);
        }, 'sendMessage');

        t(function(name, cb){
            client[name].call(client, tos, 8, 'hello !', '', cb);
        }, 'sendMessages');

        t(function(name, cb){
            client[name].call(client, gid, 8, 'hello !', '', cb);
        }, 'sendGroupMessage');

        t(function(name, cb){
            client[name].call(client, rid, 8, 'hello !', '', cb);
        }, 'sendRoomMessage');
        
        t(function(name, cb){
            client[name].call(client, { key: 'test' }, cb);
        }, 'addVariables');

        t(function(name, cb){
            client[name].call(client, friends, cb);
        }, 'addFriends');

        t(function(name, cb){
            client[name].call(client, [new Int64BE(0, 778899)], cb);
        }, 'deleteFriends');

        t(function(name, cb){
            client[name].call(client, cb);
        }, 'getFriends');

        t(function(name, cb){
            client[name].call(client, gid, [from, to], cb);
        }, 'addGroupMembers');

        t(function(name, cb){
            client[name].call(client, gid, [to], cb);
        }, 'deleteGroupMembers');

        t(function(name, cb){
            client[name].call(client, gid, cb);
        }, 'getGroupMembers');

        t(function(name, cb){
            client[name].call(client, cb);
        }, 'getUserGroups');

        t(function(name, cb){
            client[name].call(client, rid, cb);
        }, 'enterRoom');

        t(function(name, cb){
            client[name].call(client, rid, cb);
        }, 'leaveRoom');

        t(function(name, cb){
            client[name].call(client, cb);
        }, 'getUserRooms');

        t(function(name, cb){
            client[name].call(client, tos, cb);
        }, 'getOnlineUsers');

        t(function(name, cb){
            client[name].call(client, cb);
        }, 'checkUnreadMessage');

        t(function(name, cb){
            client[name].call(client, gid, 10, false, 0, 0, 0, undefined, cb);
        }, 'getGroupMessage');

        t(function(name, cb){
            client[name].call(client, rid, 10, false, 0, 0, 0, undefined, cb);
        }, 'getRoomMessage');

        t(function(name, cb){
            client[name].call(client, 10, false, 0, 0, 0, undefined, cb);
        }, 'getBroadcastMessage');

        t(function(name, cb){
            client[name].call(client, to, 10, 0, false, 0, 0, 0, undefined, cb);
        }, 'getP2PMessage');

        t(function(name, cb){
            client[name].call(client, 'IOS', 'iphone6s', 'test device token', cb);
        }, 'addDevice');

        t(function(name, cb){
            client[name].call(client, 'en', cb);
        }, 'setTranslationLanguage');

        t(function(name, cb){
            client[name].call(client, '你好!', undefined, 'en', cb);
        }, 'translate');

        t(function(name, cb){
            client[name].call(client, 'test-user', cb);
        }, 'setPushName');

        t(function(name, cb){
            client[name].call(client, cb);
        }, 'getPushName');

        t(function(name, cb){
            client[name].call(client, lat, lng, cb);
        }, 'setGeo');

        t(function(name, cb){
            client[name].call(client, cb);
        }, 'getGeo');

        t(function(name, cb){
            client[name].call(client, [from, to], cb);
        }, 'getGeos');

        t(function(name, cb){
            console.log('---------------(' + index + ')end!-----------------');
        });

        //receive from server
        let pushName = data.services.recvMessage;
        data.processor.on(pushName, function(data){
            console.log('\n[PUSH] ' + pushName + ':\n', data);
        });
    });
}