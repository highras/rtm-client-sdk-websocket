'use strict'

let step = 2;
let index = 0;

function TestCase (options, from, to) {

    from = new Rtm.RTMConfig.Int64(from);
    to = new Rtm.RTMConfig.Int64(to);

    let tos = [to, new Rtm.RTMConfig.Int64(0, 778877)];
    let gid = new Rtm.RTMConfig.Int64(0, 999999);
    let rid = new Rtm.RTMConfig.Int64(0, 666666);
    let friends = [to, new Rtm.RTMConfig.Int64(0, 778877)];
    let fuid = to;
    let lat = 39239.1123;
    let lng = 69394.4850;
    let timeout = 10 * 1000;
    let del_mid = new Rtm.RTMConfig.Int64(0);

    let self = this;

    let client = new Rtm.RTMClient(options);
    
    let t = function(fn, name) {

        setTimeout(function() {

            if (name) {

                console.log('\n[TEST] ' + name + ':');
            }

            var cb = function(err, data) {

                if (err) {

                    if (err.hasOwnProperty('mid')) {

                        console.error('\n mid:' + err.mid.toString(), err.error);
                        return;
                    }

                    console.error('\n ', err);

                }

                if (data) {

                    if (data.hasOwnProperty('mid')) {

                        console.log('\n mid:' + data.mid.toString(), data.payload);
                        return;
                    }

                    console.log('\n ', data);
                }
            };

            fn(name, cb);
        }, index * 1000 * step);

        if (name) {

            index++;
        }
    };

    return {
        client: client,
        test: function (){

            client.on('error', function(err) {

                console.error(err);
            });

            client.on('close', function(retry) {

                console.log('closed!', retry);
            });

            //receive from server
            let pushName = Rtm.RTMConfig.SERVER_PUSH.recvMessage;
            client.processor.on(pushName, function(data) {

                console.log('\n[PUSH] ' + pushName + ':\n', data);
            });

            pushName = Rtm.RTMConfig.SERVER_PUSH.recvPing;
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
                
                //rtmGate (2)
                t.call(self, function(name, cb) {

                    client[name].call(client, to, 8, 'hello !', '', new Rtm.RTMConfig.Int64(0), timeout, function(err, data){

                        if (data && data.mid) {

                            del_mid = data.mid;
                        }

                        cb && cb(err, data); 
                    });
                }, 'sendMessage');

                //rtmGate (3)
                t.call(self, function(name, cb) {

                    client[name].call(client, gid, 8, 'hello !', '', new Rtm.RTMConfig.Int64(0), timeout, cb);
                }, 'sendGroupMessage');

                //rtmGate (4)
                t.call(self, function(name, cb) {

                    client[name].call(client, rid, 8, 'hello !', '', new Rtm.RTMConfig.Int64(0), timeout, cb);
                }, 'sendRoomMessage');

                //rtmGate (5)
                t.call(self, function(name, cb) {

                    client[name].call(client, timeout, cb);
                }, 'getUnreadMessage');

                //rtmGate (6)
                t.call(self, function(name, cb) {

                    client[name].call(client, timeout, cb);
                }, 'cleanUnreadMessage');

                //rtmGate (7)
                t.call(self, function(name, cb) {

                    client[name].call(client, timeout, cb);
                }, 'getSession');

                //rtmGate (8)
                t.call(self, function(name, cb) {

                    client[name].call(client, gid, true, 10, 0, 0, 0, timeout, cb);
                }, 'getGroupMessage');

                //rtmGate (9)
                t.call(self, function(name, cb) {

                    client[name].call(client, rid, true, 10, 0, 0, 0, timeout, cb);
                }, 'getRoomMessage');

                //rtmGate (10)
                t.call(self, function(name, cb) {

                    client[name].call(client, true, 10, 0, 0, 0, timeout, cb);
                }, 'getBroadcastMessage');

                //rtmGate (11)
                t.call(self, function(name, cb) {

                    client[name].call(client, to, true, 10, 0, 0, 0, timeout, cb);
                }, 'getP2PMessage');

                //rtmGate (12)
                t.call(self, function(name, cb) {

                    client[name].call(client, 'sendfile', undefined, to, undefined, undefined, timeout, cb);
                }, 'fileToken');

                //rtmGate (14)
                t.call(self, function(name, cb) {

                    client[name].call(client, { user1: 'test user1 attrs' }, timeout, cb);
                }, 'addAttrs');

                //rtmGate (15)
                t.call(self, function(name, cb) {

                    client[name].call(client, timeout, cb);
                }, 'getAttrs');

                //rtmGate (16)
                t.call(self, function(name, cb) {

                    client[name].call(client, 'msg', 'attrs', timeout, cb);
                }, 'addDebugLog');

                //rtmGate (17)
                t.call(self, function(name, cb) {

                    client[name].call(client, 'app-info', 'device-token', timeout, cb);
                }, 'addDevice');

                //rtmGate (18)
                t.call(self, function(name, cb) {

                    client[name].call(client, 'device-token', timeout, cb);
                }, 'removeDevice');

                //rtmGate (19)
                t.call(self, function(name, cb) {

                    client[name].call(client, 'en', timeout, cb);
                }, 'setTranslationLanguage');

                //rtmGate (20)
                t.call(self, function(name, cb) {

                    client[name].call(client, '你好!', undefined, 'en', timeout, cb);
                }, 'translate');

                //rtmGate (21)
                t.call(self, function(name, cb) {

                    client[name].call(client, friends, timeout, cb);
                }, 'addFriends');

                //rtmGate (22)
                t.call(self, function(name, cb) {

                    client[name].call(client, [new Rtm.RTMConfig.Int64(0, 778899)], timeout, cb);
                }, 'deleteFriends');

                //rtmGate (23)
                t.call(self, function(name, cb) {

                    client[name].call(client, timeout, cb);
                }, 'getFriends');

                //rtmGate (24)
                t.call(self, function(name, cb) {

                    client[name].call(client, gid, [from, to], timeout, cb);
                }, 'addGroupMembers');

                //rtmGate (25)
                t.call(self, function(name, cb) {

                    client[name].call(client, gid, [to], timeout, cb);
                }, 'deleteGroupMembers');

                //rtmGate (26)
                t.call(self, function(name, cb) {

                    client[name].call(client, gid, timeout, cb);
                }, 'getGroupMembers');

                //rtmGate (27)
                t.call(self, function(name, cb) {

                    client[name].call(client, timeout, cb);
                }, 'getUserGroups');

                //rtmGate (28)
                t.call(self, function(name, cb) {

                    client[name].call(client, rid, timeout, cb);
                }, 'enterRoom');

                //rtmGate (29)
                t.call(self, function(name, cb) {

                    client[name].call(client, rid, timeout, cb);
                }, 'leaveRoom');

                //rtmGate (30)
                t.call(self, function(name, cb) {

                    client[name].call(client, timeout, cb);
                }, 'getUserRooms');

                //rtmGate (31)
                t.call(self, function(name, cb) {

                    client[name].call(client, tos, timeout, cb);
                }, 'getOnlineUsers');

                //rtmGate (32)
                t.call(self, function(name, cb) {

                    client[name].call(client, del_mid, to, 1, timeout, cb);
                }, 'deleteMessage');

                //rtmGate (33)
                t.call(self, function(name, cb) {

                    client[name].call(client, '', timeout, cb);
                }, 'kickout'); 

                //rtmGate (35)
                t.call(self, function(name, cb) {

                    client[name].call(client, 'db-test-key', 'db-test-value', timeout, cb);
                }, 'dbSet'); 

                //rtmGate (34)
                t.call(self, function(name, cb) {

                    client[name].call(client, 'db-test-key', timeout, cb);
                }, 'dbGet'); 

                //rtmGate (13)
                t.call(self, function(name, cb) {

                    // client[name].call(client);
                }, 'close');

                t.call(self, function(name, cb) {

                    console.log('---------------(' + index + ')end!-----------------');
                });
            });
            
            //rtmGate (1)
            client.login();
        }
    };
}
