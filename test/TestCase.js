'use strict'

let step = 2;
let index = 0;

function TestCase (options, from, to) {

    from = new rtm.RTMConfig.Int64(from);
    to = new rtm.RTMConfig.Int64(to);

    let tos = [to, new rtm.RTMConfig.Int64(0, 778877)];
    let gid = new rtm.RTMConfig.Int64(0, 999999);
    let rid = new rtm.RTMConfig.Int64(0, 666666);
    let friends = [to, new rtm.RTMConfig.Int64(0, 778877)];
    let fuid = to;
    let lat = 39239.1123;
    let lng = 69394.4850;
    let timeout = 10 * 1000;
    let del_mid = new rtm.RTMConfig.Int64(0);

    let self = this;

    let client = new rtm.RTMClient(options);
    
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

                    console.log("error:\n");
                    console.error('\n ', err);

                }

                if (data) {

                    if (data.hasOwnProperty('mid')) {

                        console.log('\n mid:' + data.mid.toString(), data.payload);
                        return;
                    }
                    console.log("ok:\n");
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
        options: options,
        client: client,
        test: function (){
            console.log(rtm.RTMConfig.SDK_VERSION);

            client.on('ErrorRecorder', function(err) {
                console.error("on ErrorRecorder");
                console.error(err);
            });

            client.on('ReloginCompleted', function(successful ,retryAgain, errorCode, retriedCount) {
                console.log("ReloginCompleted, successful: " + successful + " retryAgain: " + retryAgain + " errorCode: " + errorCode + " retriedCount: " + retriedCount);
            });

            client.on('SessionClosed', function(errorCode) {
                console.log("SessionClosed, errorCode: " + errorCode);
                if (errorCode == rtm.RTMConfig.ERROR_CODE.RTM_EC_INVALID_AUTH_TOEKN) {
                    // TODO token error
                }
            });

            //receive from server
            let pushName1 = rtm.RTMConfig.SERVER_PUSH.recvMessage;
            client.processor.on(pushName1, function(data) {

                console.log('\n[PUSH] ' + pushName1 + ':\n', data);
            });

            let pushName2 = rtm.RTMConfig.SERVER_PUSH.recvPing;
            client.processor.on(pushName2, function(data) {

                console.log('\n[PUSH] ' + pushName2 + ':\n', data);
            });

            let pushName3 = rtm.RTMConfig.SERVER_PUSH.recvChat;
            client.processor.on(pushName3, function(data) {

                console.log('\n[PUSH] ' + pushName3 + ':\n', data);
            });

            let pushName4 = rtm.RTMConfig.SERVER_PUSH.recvAudio;
            client.processor.on(pushName4, function(data) {

                console.log('\n[PUSH Audio] ' + pushName4 + ':\n', data);
            });

            client.login(options.uid, options.token, function(ok, errorCode) {

                if (errorCode == fpnn.FPConfig.ERROR_CODE.FPNN_EC_OK) {

                    if (!ok) {
                        console.log("token error in login callback");
                        // TODO
                        return;
                    } else {

                        console.log('login success');

                        console.log('---------------begin!-----------------');

                        return;

                        /*client.getP2PUnreadMessageNum([new rtm.RTMConfig.Int64(123), new rtm.RTMConfig.Int64(789)], new rtm.RTMConfig.Int64(1610424000000), [90], 3000, function(err, data){
                            if (err) {
                                console.log(err);
                            } else {
                                console.log(data);
                            }
                        });*/

                        t.call(self, function(name, cb) {
                            client[name].call(client, 1000, 51, "hello", "", new rtm.RTMConfig.Int64(0), timeout, cb);
                        }, 'sendMessage');

                        t.call(self, function(name, cb) {
                            client[name].call(client, 10127, true, 20, 0, 0, 0, undefined, timeout, cb);
                        }, 'getGroupMessage');

                        t.call(self, function(name, cb) {
                            client[name].call(client, [new rtm.RTMConfig.Int64(8888)], timeout, cb);
                        }, 'addBlacks');

                        t.call(self, function(name, cb) {
                            client[name].call(client, timeout, function(err, data)
                            {
                                console.log(data);
                                cb && cb(err, data); 
                            });
                        }, 'getBlacks');

                        t.call(self, function(name, cb) {
                            client[name].call(client, [new rtm.RTMConfig.Int64(8888)], timeout, cb);
                        }, 'deleteBlacks');

                        t.call(self, function(name, cb) {

                            client[name].call(client, to, 'hello !', '', new rtm.RTMConfig.Int64(0), timeout, function(err, data){

                                if (data && data.mid) {

                                    del_mid = data.mid;
                                }

                                cb && cb(err, data); 
                            });
                        }, 'sendChat');

                        t.call(self, function(name, cb) {

                            client[name].call(client, 111, true, 20, 0, 0, 0, timeout, cb);
                        }, 'getP2PChat');
                        

                        t.call(self, function(name, cb) {

                            client[name].call(client, rid, 'hello !', '', new rtm.RTMConfig.Int64(0), timeout, function(err, data){

                                if (data && data.mid) {

                                    del_mid = data.mid;
                                }

                                cb && cb(err, data); 
                            });
                        }, 'sendRoomChat');

                        t.call(self, function(name, cb) {

                            client[name].call(client, rid, true, 10, 0, 0, 0, timeout, cb);
                        }, 'getRoomChat');
                        
                        //rtmGate (2)
                        t.call(self, function(name, cb) {

                            client[name].call(client, to, 8, 'hello !', '', new rtm.RTMConfig.Int64(0), timeout, function(err, data){

                                if (data && data.mid) {

                                    del_mid = data.mid;
                                }

                                cb && cb(err, data); 
                            });
                        }, 'sendMessage');

                        //rtmGate (3)
                        t.call(self, function(name, cb) {

                            client[name].call(client, gid, 8, 'hello !', '', new rtm.RTMConfig.Int64(0), timeout, cb);
                        }, 'sendGroupMessage');

                        //rtmGate (4)
                        t.call(self, function(name, cb) {

                            client[name].call(client, rid, 8, 'hello !', '', new rtm.RTMConfig.Int64(0), timeout, cb);
                        }, 'sendRoomMessage');

                        //rtmGate (5)
                        t.call(self, function(name, cb) {

                            client[name].call(client, false, timeout, cb);
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

                            client[name].call(client, '你好!', 'zh-CN', 'en', undefined, undefined, timeout, cb);
                        }, 'translate');

                        t.call(self, function(name, cb) {

                            client[name].call(client, '出售 海洛因', true, timeout, cb);
                        }, 'profanity');


                        //rtmGate (21)
                        t.call(self, function(name, cb) {

                            client[name].call(client, friends, timeout, cb);
                        }, 'addFriends');

                        //rtmGate (22)
                        t.call(self, function(name, cb) {

                            client[name].call(client, [new rtm.RTMConfig.Int64(0, 778899)], timeout, cb);
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

                    }
                } else {
                    console.log("login error, code: " + errorCode);
                }
            });
            
        }
    };
}
