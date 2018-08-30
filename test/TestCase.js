'use strict'

let step = 2;
let index = 0;

function TestCase (options, from, to) {
    from = new Int64BE(from);
    to = new Int64BE(to);

    let tos = [to, new Int64BE(0, 778877)];
    let gid = new Int64BE(0, 999999);
    let rid = new Int64BE(0, 666666);
    let friends = [to, new Int64BE(0, 778877)];
    let fuid = to;
    let lat = 39239.1123;
    let lng = 69394.4850;
    let timeout = 10 * 1000;

    let self = this;

    let client = new RTMClient(options);
    
    let t = function(fn, name) {

        setTimeout(function() {

            var cb = function(err, data) {
                
                if (err) {

                    console.error('\n[ERR] ' + name + ':\n', err.message);
                }

                if (data) {

                    console.log('\n[DATA] ' + name + ':\n', data);
                }
            };

            fn(name, cb);
        }, index * 1000 * step);

        if (name) {

            index++;
        }
    };

    return function (){
        client.on('error', function(err) {

            console.error(err);
        });

        client.on('close', function(retry) {

            console.log('closed!', retry);
        });

        client.login();

        //receive from server
        let pushName = client.rtmConfig.SERVER_PUSH.recvMessage;
        client.processor.on(pushName, function(data) {

            console.log('\n[PUSH] ' + pushName + ':\n', data);
        });

        pushName = client.rtmConfig.SERVER_PUSH.recvPing;
        client.processor.on(pushName, function(data) {

            console.log('\n[PUSH] ' + pushName + ':\n', data);
        });

        //send to server
        client.on('login', function(data) {

            if (data.error) {

                console.error(data.error);
                return;
            }

            index = 0;
            console.log('login with ' + data.endpoint + '\n\n');

            t.call(self, function(name, cb) {

                console.log('---------------begin!-----------------')
            });
            
            t.call(self, function(name, cb) {

                client[name].call(client, to, 8, 'hello !', '', timeout, cb);
            }, 'sendMessage');

            t.call(self, function(name, cb) {

                client[name].call(client, tos, 8, 'hello !', '', timeout, cb);
            }, 'sendMessages');

            t.call(self, function(name, cb) {

                client[name].call(client, gid, 8, 'hello !', '', timeout, cb);
            }, 'sendGroupMessage');

            t.call(self, function(name, cb) {

                client[name].call(client, rid, 8, 'hello !', '', timeout, cb);
            }, 'sendRoomMessage');
            
            t.call(self, function(name, cb) {

                client[name].call(client, { key: 'test' }, timeout, cb);
            }, 'addVariables');

            t.call(self, function(name, cb) {

                client[name].call(client, friends, timeout, cb);
            }, 'addFriends');

            t.call(self, function(name, cb) {

                client[name].call(client, [new Int64BE(0, 778899)], timeout, cb);
            }, 'deleteFriends');

            t.call(self, function(name, cb) {

                client[name].call(client, timeout, cb);
            }, 'getFriends');

            t.call(self, function(name, cb) {

                client[name].call(client, gid, [from, to], timeout, cb);
            }, 'addGroupMembers');

            t.call(self, function(name, cb) {

                client[name].call(client, gid, [to], timeout, cb);
            }, 'deleteGroupMembers');

            t.call(self, function(name, cb) {

                client[name].call(client, gid, timeout, cb);
            }, 'getGroupMembers');

            t.call(self, function(name, cb) {

                client[name].call(client, timeout, cb);
            }, 'getUserGroups');

            t.call(self, function(name, cb) {

                client[name].call(client, rid, timeout, cb);
            }, 'enterRoom');

            t.call(self, function(name, cb) {

                client[name].call(client, rid, timeout, cb);
            }, 'leaveRoom');

            t.call(self, function(name, cb) {

                client[name].call(client, timeout, cb);
            }, 'getUserRooms');

            t.call(self, function(name, cb) {

                client[name].call(client, tos, timeout, cb);
            }, 'getOnlineUsers');

            t.call(self, function(name, cb) {

                client[name].call(client, timeout, cb);
            }, 'checkUnreadMessage');

            t.call(self, function(name, cb) {

                client[name].call(client, gid, 10, false, 0, 0, 0, undefined, timeout, cb);
            }, 'getGroupMessage');

            t.call(self, function(name, cb) {

                client[name].call(client, rid, 10, false, 0, 0, 0, undefined, timeout, cb);
            }, 'getRoomMessage');

            t.call(self, function(name, cb) {

                client[name].call(client, 10, false, 0, 0, 0, undefined, timeout, cb);
            }, 'getBroadcastMessage');

            t.call(self, function(name, cb) {

                client[name].call(client, to, 10, 0, false, 0, 0, 0, undefined, timeout, cb);
            }, 'getP2PMessage');

            t.call(self, function(name, cb) {

                client[name].call(client, 'app-info', 'device-token', timeout, cb);
            }, 'addDevice');

            t.call(self, function(name, cb) {

                client[name].call(client, 'device-token', timeout, cb);
            }, 'removeDevice');

            t.call(self, function(name, cb) {

                client[name].call(client, 'en', timeout, cb);
            }, 'setTranslationLanguage');

            t.call(self, function(name, cb) {

                client[name].call(client, '你好!', undefined, 'en', timeout, cb);
            }, 'translate');

            t.call(self, function(name, cb) {

                client[name].call(client, lat, lng, timeout, cb);
            }, 'setGeo');

            t.call(self, function(name, cb) {

                client[name].call(client, timeout, cb);
            }, 'getGeo');

            t.call(self, function(name, cb) {

                client[name].call(client, [from, to], timeout, cb);
            }, 'getGeos');

            t.call(self, function(name, cb) {

                console.log('---------------(' + index + ')end!-----------------');
            });
        });
    }();
}
