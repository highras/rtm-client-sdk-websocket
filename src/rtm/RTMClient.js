'use strict'

const FPConfig = require('../fpnn/FPConfig');
const FPEvent = require('../fpnn/FPEvent');
const FPClient = require('../fpnn/FPClient');
const RTMConfig = require('./RTMConfig');
const RTMProcessor = require('./RTMProcessor');
const RTMProxy = require('./RTMProxy');

class RTMClient {

    /**
     * 
     * @param {object} options 
     * 
     * options:
     * {string} options.dispatch
     * {number} options.pid 
     * {Int64} options.uid
     * {string} options.token
     * {bool} options.autoReconnect 
     * {number} options.connectionTimeout 
     * {string} options.version
     * {bool} options.recvUnreadMsgStatus
     * {bool} options.ssl
     * {string} options.proxyEndpoint
     */
    constructor(options) {

        FPEvent.assign(this);

        this._dispatch = options.dispatch;
        this._pid = options.pid;
        this._uid = options.uid;
        this._token = options.token;
        this._version = options.version;
        this._recvUnreadMsgStatus = options.recvUnreadMsgStatus !== undefined ? options.recvUnreadMsgStatus : true;
        this._ssl = options.ssl !== undefined ? options.ssl : true;
        this._autoReconnect = options.autoReconnect !== undefined ? options.autoReconnect : true;
        this._connectionTimeout = options.connectionTimeout || 30 * 1000;

        if (this._ssl) {

            this._proxyEndpoint = options.proxyEndpoint; 
        }

        this._midSeq = 0;
        this._saltSeq = 0;
        this._endpoint = null;
        this._ipv6 = false;

        this._rtmClient = null;
        this._dispatchClient = null;
        this._loginOptions = null; 
        this._reconnectID = 0;

        this._isClose = false;

        this._msgOptions = {

            codec: RTMConfig.MsgPack.createCodec({  

                int64: true
            }) 
        };

        this._processor = new RTMProcessor();

        if (this._proxyEndpoint) {

            let endpoint = buildEndpoint.call(this, this._proxyEndpoint);
            this._proxy = new RTMProxy(endpoint);
        }
    }


    get msgOptions() {

        return this._msgOptions;
    }

    get processor() {

        return this._processor;
    }

    /**
     * 
     * @param {string} endpoint
     * @param {bool} ipv6 
     */
    login(endpoint, ipv6) {

        this._endpoint = endpoint || null;
        this._ipv6 = ipv6 || false;
        this._isClose = false;

        if (this._endpoint) {

            connectRTMGate.call(this);
            return;
        }

        let self = this;

        getRTMGate.call(this, 'rtmGated', function(err, data) {

            if (data) {
                
                self.login(data.endpoint, self._ipv6);
            }

            if (err) {

                reConnect.call(self);
            }
        }, this._connectionTimeout);
    }

    /**
     * 
     * @param {Int64} to 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    sendMessage(to, mtype, msg, attrs, timeout, callback) {
        
        attrs = attrs || '';

        let payload = {
            to: to,
            mid: genMid.call(this),
            mtype: mtype,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64>} tos
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    sendMessages(tos, mtype, msg, attrs, timeout, callback) {

        attrs = attrs || '';

        let payload = {
            tos: tos,
            mid: genMid.call(this),
            mtype: mtype,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendmsgs',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64} gid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    sendGroupMessage(gid, mtype, msg, attrs, timeout, callback) {
        
        attrs = attrs || '';

        let payload = {
            gid: gid,
            mid: genMid.call(this),
            mtype: mtype,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendgroupmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64} rid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    sendRoomMessage(rid, mtype, msg, attrs, timeout, callback) {

        attrs = attrs || '';

        let payload = {
            rid: rid,
            mid: genMid.call(this),
            mtype: mtype,
            msg: msg,
            attrs: attrs
        };

        let options = {
            flag: 1,
            method: 'sendroommsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     */
    close() {

        let payload = {};

        let options = {
            flag: 1,
            method: 'bye',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        let self = this;
        this._isClose = true;

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            self._rtmClient.close();
        });
    }

    /**
     * 
     * @param {object} dict 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    addVariables(dict, timeout, callback) {

        let payload = {
            var: dict
        };

        let options = {
            flag: 1,
            method: 'addvariables',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64>} friends 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    addFriends(friends, timeout, callback) {

        let payload = {
            friends: friends
        };

        let options = {
            flag: 1,
            method: 'addfriends',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64>} friends 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    deleteFriends(friends, timeout, callback) {

        let payload = {
            friends: friends
        };

        let options = {
            flag: 1,
            method: 'delfriends',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
    getFriends(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getfriends',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let uids = data['uids'];

            if (uids) {

                let buids = [];

                uids.forEach(function(item, index) {

                    buids[index] = new RTMConfig.Int64(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64} gid 
     * @param {array<Int64>} uids 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    addGroupMembers(gid, uids, timeout, callback) {

        let payload = {
            gid: gid,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'addgroupmembers',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };
        
        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64} gid 
     * @param {array<Int64>} uids 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    deleteGroupMembers(gid, uids, timeout, callback) {
        
        let payload = {
            gid: gid,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'delgroupmembers',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64} gid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
    getGroupMembers(gid, timeout, callback) {

        let payload = {
            gid: gid
        };

        let options = {
            flag: 1,
            method: 'getgroupmembers',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let uids = data['uids'];

            if (uids) {

                let buids = [];
                uids.forEach(function(item, index) {

                    buids[index] = new RTMConfig.Int64(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
    getUserGroups(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getusergroups',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let gids = data['gids'];

            if (gids) {

                let bgids = [];

                gids.forEach(function(item, index) {

                    bgids[index] = new RTMConfig.Int64(item);
                });

                callback(null, bgids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64} rid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    enterRoom(rid, timeout, callback) {

        let payload = {
            rid: rid
        };

        let options = {
            flag: 1,
            method: 'enterroom',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64} rid 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data
     */
    leaveRoom(rid, timeout, callback) {

        let payload = {
            rid: rid
        };

        let options = {
            flag: 1,
            method: 'leaveroom',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
    getUserRooms(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getuserrooms',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let rids = data['rooms'];

            if (rids) {

                let brids = [];

                rids.forEach(function(item, index) {
                    
                    brids[index] = new RTMConfig.Int64(item);
                });

                callback(null, brids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {array<Int64>} uids 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<Int64>} data
     */
    getOnlineUsers(uids, timeout, callback) {
        
        let payload = {
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'getonlineusers',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let uids = data['uids'];

            if (uids) {

                let buids = [];

                uids.forEach(function(item, index) {

                    buids[index] = new RTMConfig.Int64(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<p2p:array<Int64>, group:array<Int64>, bc:bool>} data
     */
    checkUnreadMessage(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'checkunreadmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {
            
            if (err) {

                callback(err, null);
                return;
            }

            let uids = data['p2p'];

            if (uids) {

                let buids = [];

                uids.forEach(function(item, index) {

                    buids[index] = new RTMConfig.Int64(item);
                });

                data.p2p = buids;
            }

            let gids = data['group'];

            if (gids) {

                let bgids = [];

                gids.forEach(function(item, index) {

                    bgids[index] = new RTMConfig.Int64(item);
                });

                data.group = bgids;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64} gid 
     * @param {number} num
     * @param {bool} desc 
     * @param {number} page
     * @param {Int64} localmid
     * @param {Int64} localid
     * @param {array<number>} mtypes
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, maxid:Int64, msgs:array<GroupMsg>>} data 
     * 
     * <GroupMsg>
     * @param {Int64} GroupMsg.id
     * @param {Int64} GroupMsg.from
     * @param {number} GroupMsg.mtype
     * @param {number} GroupMsg.ftype
     * @param {Int64} GroupMsg.mid
     * @param {string} GroupMsg.msg
     * @param {string} GroupMsg.attrs
     * @param {number} GroupMsg.mtime
     */
    getGroupMessage(gid, num, desc, page, localmid, localid, mtypes, timeout, callback) {
        
        let payload = {
            gid: gid,
            num: num,
            desc: desc,
            page: page
        };

        if (localmid !== undefined) {

            payload.localmid = localmid;
        }

        if (localid !== undefined) {

            payload.localid = localid;
        }

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getgroupmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                let bmsgs = [];

                msgs.forEach(function(item, index) {

                    bmsgs[index] = {
                        id: new RTMConfig.Int64(item[0]),
                        from: new RTMConfig.Int64(item[1]),
                        mtype: Number(item[2]),
                        ftype: Number(item[3]),
                        mid: new RTMConfig.Int64(item[4]),
                        msg: item[5],
                        attrs: item[6],
                        mtime: Number(item[7])
                    };
                });

                data.msgs = bmsgs;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64} rid 
     * @param {number} num
     * @param {bool} desc 
     * @param {number} page
     * @param {Int64} localmid
     * @param {Int64} localid
     * @param {array<number>} mtypes
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, maxid:Int64, msgs:array<RoomMsg>>} data 
     * 
     * <RoomMsg>
     * @param {Int64} RoomMsg.id
     * @param {Int64} RoomMsg.from
     * @param {number} RoomMsg.mtype
     * @param {number} RoomMsg.ftype
     * @param {Int64} RoomMsg.mid
     * @param {string} RoomMsg.msg
     * @param {string} RoomMsg.attrs
     * @param {number} RoomMsg.mtime
     */
    getRoomMessage(rid, num, desc, page, localmid, localid, mtypes, timeout, callback) {

        let payload = {
            rid: rid,
            num: num,
            desc: desc,
            page: page
        };

        if (localmid !== undefined) {

            payload.localmid = localmid;
        }

        if (localid !== undefined) {

            payload.localid = localid;
        }

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getroommsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                let bmsgs = [];

                msgs.forEach(function(item, index) {

                    bmsgs[index] = {
                        id: new RTMConfig.Int64(item[0]),
                        from: new RTMConfig.Int64(item[1]),
                        mtype: Number(item[2]),
                        ftype: Number(item[3]),
                        mid: new RTMConfig.Int64(item[4]),
                        msg: item[5],
                        attrs: item[6],
                        mtime: Number(item[7])
                    };
                });

                data.msgs = bmsgs;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {number} num
     * @param {bool} desc 
     * @param {number} page
     * @param {Int64} localmid
     * @param {Int64} localid
     * @param {array<number>} mtypes
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, maxid:Int64, msgs:array<BroadcastMsg>>} data 
     * 
     * <BroadcastMsg>
     * @param {Int64} BroadcastMsg.id
     * @param {Int64} BroadcastMsg.from
     * @param {number} BroadcastMsg.mtype
     * @param {number} BroadcastMsg.ftype
     * @param {Int64} BroadcastMsg.mid
     * @param {string} BroadcastMsg.msg
     * @param {string} BroadcastMsg.attrs
     * @param {number} BroadcastMsg.mtime
     */
    getBroadcastMessage(num, desc, page, localmid, localid, mtypes, timeout, callback) {

        let payload = {
            num: num,
            desc: desc,
            page: page
        };

        if (localmid !== undefined) {

            payload.localmid = localmid;
        }

        if (localid !== undefined) {

            payload.localid = localid;
        }

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getbroadcastmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                let bmsgs = [];

                msgs.forEach(function(item, index) {

                    bmsgs[index] = {
                        id: new RTMConfig.Int64(item[0]),
                        from: new RTMConfig.Int64(item[1]),
                        mtype: Number(item[2]),
                        ftype: Number(item[3]),
                        mid: new RTMConfig.Int64(item[4]),
                        msg: item[5],
                        attrs: item[6],
                        mtime: Number(item[7])
                    };
                });

                data.msgs = bmsgs;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64} peeruid 
     * @param {number} num
     * @param {number} direction 
     * @param {bool} desc 
     * @param {number} page
     * @param {Int64} localmid
     * @param {Int64} localid
     * @param {array<number>} mtypes
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<num:number, maxid:Int64, msgs:array<P2PMessage>>} data 
     * 
     * <P2PMessage>
     * @param {Int64} P2PMessage.id
     * @param {number} P2PMessage.direction
     * @param {number} P2PMessage.mtype
     * @param {number} P2PMessage.ftype
     * @param {Int64} P2PMessage.mid
     * @param {string} P2PMessage.msg
     * @param {string} P2PMessage.attrs
     * @param {number} P2PMessage.mtime
     */
    getP2PMessage(peeruid, num, direction, desc, page, localmid, localid, mtypes, timeout, callback) {

        let payload = {
            ouid: peeruid,
            num: num,
            direction: direction,
            desc: desc,
            page: page
        };

        if (localmid !== undefined) {

            payload.localmid = localmid;
        }

        if (localid !== undefined) {

            payload.localid = localid;
        }

        if (mtypes !== undefined) {

            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getp2pmsg',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let msgs = data['msgs'];

            if (msgs) {

                let bmsgs = [];

                msgs.forEach(function(item, index) {

                    bmsgs[index] = {
                        id: new RTMConfig.Int64(item[0]),
                        direction: Number(item[1]),
                        mtype: Number(item[2]),
                        ftype: Number(item[3]),
                        mid: new RTMConfig.Int64(item[4]),
                        msg: item[5],
                        attrs: item[6],
                        mtime: Number(item[7])
                    };
                });

                data.msgs = bmsgs;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {string} apptype 
     * @param {string} devicetoken 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    addDevice(apptype, devicetoken, timeout, callback) {

        let payload = {
            apptype: apptype,
            devicetoken: devicetoken
        };

        let options = {
            flag: 1,
            method: 'adddevice',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {string} devicetoken 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    removeDevice(devicetoken, timeout, callback) {

        let payload = {
            devicetoken: devicetoken
        };

        let options = {
            flag: 1,
            method: 'removedevice',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {string} targetLanguage 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    setTranslationLanguage(targetLanguage, timeout, callback) {

        let payload = {
            lang: targetLanguage
        };

        let options = {
            flag: 1,
            method: 'setlang',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {string} originalMessage 
     * @param {string} originalLanguage 
     * @param {string} targetLanguage 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<stext:string, src:string, dtext:string, dst:string>} data 
     */
    translate(originalMessage, originalLanguage, targetLanguage, timeout, callback) {

        let payload = {
            text: originalMessage,
            dst: targetLanguage
        };

        if (originalLanguage !== undefined) {

            payload.src = originalLanguage;
        }

        let options = {
            flag: 1,
            method: 'translate',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {number} lat 
     * @param {number} lng 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    setGeo(lat, lng, timeout, callback) {

        let payload = {
            lat: lat,
            lng: lng
        };

        let options = {
            flag: 1,
            method: 'setgeo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object<lat:number, lng:number>} data 
     */
    getGeo(timeout, callback) {

        let payload = {};

        let options = {
            flag: 1,
            method: 'getgeo',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64>} uids
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {array<array<uid:Int64,lat:number,lng:number>>} data 
     */
    getGeos(uids, timeout, callback) {

        let payload = {
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'getgeos',
            payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._rtmClient, options, function(err, data) {

            if (err) {

                callback(err, null);
                return;
            }

            let geos = data['geos'];

            if (geos) {

                let bgeos = [];

                geos.forEach(function(item, index) {

                    item[0] = new RTMConfig.Int64(item[0]);
                    bgeos[index] = item;
                });

                callback(null, bgeos);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {number} mtype 
     * @param {Int64} to 
     * @param {File} file
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    sendFile(mtype, to, file, timeout, callback) {

        let ops = {
            cmd: 'sendfile',
            mtype: mtype,
            to: to,
            file: file
        };

        fileSendProcess.call(this, ops, callback, timeout);
    }

    /**
     * 
     * @param {number} mtype 
     * @param {array<Int64>} tos 
     * @param {File} file
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    sendFiles(mtype, tos, file, timeout, callback) {

        let ops = {
            cmd: 'sendfiles',
            mtype: mtype,
            tos: tos,
            file: file
        };

        fileSendProcess.call(this, ops, callback, timeout);
    }

    /**
     * 
     * @param {number} mtype 
     * @param {Int64} gid 
     * @param {File} file
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    sendGroupFile(mtype, gid, file, timeout, callback) {

        let ops = {
            cmd: 'sendgroupfile',
            mtype: mtype,
            gid: gid,
            file: file
        };

        fileSendProcess.call(this, ops, callback, timeout);
    }

    /**
     * 
     * @param {number} mtype 
     * @param {Int64} rid 
     * @param {File} file
     * @param {number} timeout 
     * @param {function} callback 
     * 
     * @callback
     * @param {Error} err
     * @param {object} data 
     */
    sendRoomFile(mtype, rid, file, timeout, callback) {

        let ops = {
            cmd: 'sendroomfile',
            mtype: mtype,
            rid: rid,
            file: file
        };

        fileSendProcess.call(this, ops, callback, timeout);
    }

    sendQuest(options, callback, timeout) {

        sendQuest.call(this, this._rtmClient, options, callback, timeout);
    }

    connect(endpoint, timeout) {

        if (this._rtmClient != null && this._rtmClient.isOpen) {

            this._rtmClient.close();
            return;
        }

        this._endpoint = endpoint;
    
        this._rtmClient = new FPClient({ 
            endpoint: buildEndpoint.call(this, this._endpoint), 
            autoReconnect: true,
            connectionTimeout: this._connectionTimeout,
            proxy: this._proxy
        });
    
        let self = this;
    
        this._rtmClient.connect();
    
        this._rtmClient.on('connect', function() {
    
            self.emit('connect');
        });
    
        this._rtmClient.on('close', function() {
    
            onClose.call(self);
        });
    
        this._rtmClient.on('error', function(err) {
            
            self.emit('error', err);
        });
    
        this._rtmClient.processor = this._processor;
    }


}

function fileSendProcess(ops, callback, timeout) {

    let self = this;
    let reader = new FileReader();

    reader.onload = function(e) {

        ops.fileContent = Buffer.from(e.target.result);

        if (!ops.fileContent) {

            self.emit('error', new Error('no file content!'));
            return;
        }

        filetoken.call(self, ops, function(err, data) {

            if (err) {

                self.emit('error', err);
                return;
            }

            let token = data["token"];
            let endpoint = data["endpoint"];

            let ext = null;

            if (!ext) {

                let extIdx = ops.file.name.lastIndexOf('.');

                if (extIdx > 0 && extIdx < ops.file.name.length - 1) {

                    ext = ops.file.name.slice(extIdx + 1);
                }
            }

            let sign = cyrMD5.call(self, cyrMD5.call(self, ops.fileContent) + ':' + token);
            let client = new FPClient({ 
                endpoint: buildEndpoint.call(self, endpoint),
                autoReconnect: false,
                connectionTimeout: timeout,
                proxy: self._proxy
            });

            client.connect();
            client.on('connect', function() {

                let options = {
                    method: ops.cmd,
                    token: token,
                    from: self._uid,
                    mtype: ops.mtype,
                    sign: sign,
                    ext: ext,
                    data: ops.fileContent
                };

                if (ops.tos !== undefined) {

                    options.tos = ops.tos;
                }
            
                if (ops.to !== undefined) {

                    options.to = ops.to;
                }
            
                if (ops.rid !== undefined) {

                    options.rid = ops.rid;
                }
            
                if (ops.gid !== undefined) {

                    options.gid = ops.gid;
                }

                fileSend.call(self, client, options, callback, timeout);
            });

            client.on('error', function(err) {

                self.emit('error', new Error('file client: ' + err.message));
            });
        }, timeout);
    };

    reader.readAsArrayBuffer(ops.file);
}

function filetoken(ops, callback, timeout) {

    let payload = {
        cmd: ops.cmd
    };

    if (ops.tos !== undefined) {

		payload.tos = ops.tos;
    }

	if (ops.to !== undefined) {

		payload.to = ops.to;
    }

	if (ops.rid !== undefined) {

		payload.rid = ops.rid;
    }

	if (ops.gid !== undefined) {

		payload.gid = ops.gid;
    }

    let options = {
        flag: 1,
        method: 'filetoken',
        payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, this._rtmClient, options, callback, timeout);
}

function fileSend(client, ops, callback, timeout) {

    let payload = {
        pid: this._pid,
        token: ops.token,
        mtype: ops.mtype,
        from: ops.from,
        to: ops.to,
        mid: genMid.call(this),
        file: ops.data,
        attrs: JSON.stringify({ sign: ops.sign, ext: ops.ext })
    };

    let options = {
        flag: 1,
        method: ops.method,
        payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, client, options, callback, timeout);
}

function genMid() {

    if (++this._midSeq >= 999) {

        this._midSeq = 0;
    }

    return new RTMConfig.Int64(Date.now().toString() + this._midSeq);
}

function cyrMD5(data) {

    return require('../../libs/md5.min')(data);
}

function isException(data) {
    
    if (!data) {

        return null;
    }

    if (data instanceof Error) {

        return data;
    }

    if (data.hasOwnProperty('code') && data.hasOwnProperty('ex')) {

        return new Error('code: ' + data.code + ', ex: ' + data.ex);
    }

    return null;
}

function sendQuest(client, options, callback, timeout) {

    let self = this;

    client.sendQuest(options, function(data) {
        
        if (!callback) {

            return;
        }

        let err = null;

        if (data.payload) {

            let payload = RTMConfig.MsgPack.decode(data.payload, self._msgOptions);
            err = isException.call(self, payload);

            if (err) {

                callback(err, null);
                return;
            }

            callback(null, payload);
            return;
        }

        err = isException.call(self, data);

        if (err) {

            callback(data, null);
            return;
        }

        callback(null, data);
    }, timeout);
}

function getRTMGate(service, callback, timeout) {
    
	let self = this;

    if (this._dispatchClient == null) {

        this._dispatchClient = new FPClient({
            endpoint: buildEndpoint.call(this, this._dispatch),
            autoReconnect: false,
            connectionTimeout: this._connectionTimeout,
            proxy: this._proxy
        });

        this._dispatchClient.on('connect', function() {

            let payload = {
                pid: self._pid,
                uid: self._uid,
                what: service,
                addrType: self._ipv6 ? 'ipv6' : 'ipv4',
                version: self._version
            };
        
            let options = {
                flag: 1,
                method: 'which',
                payload: RTMConfig.MsgPack.encode(payload, self._msgOptions)
            };
        
            sendQuest.call(self, self._dispatchClient, options, function (err, data){
                if (data) {
                    
                    self._dispatchClient.close();
                    callback(null, data);
                }

                if (err) {

                    self._dispatchClient.close(err);
                    callback(err, null);
                }
            }, timeout);
        });
    }

    if (!this._dispatchClient.hasConnect) {

        this._dispatchClient.connect();
    }
}

function buildEndpoint(endpoint) {
    
    if (this._proxy) {

        return endpoint;
    }

    let protol = 'ws://';

    if (this._ssl) {

        protol = 'wss://';
    }

    return protol + endpoint + '/service/websocket';
}

function connectRTMGate(timeout) {

    if (this._rtmClient != null && this._rtmClient.isOpen) {

        this._rtmClient.close();
        return;
    }

    this._rtmClient = new FPClient({ 
        endpoint: buildEndpoint.call(this, this._endpoint), 
        autoReconnect: false,
        connectionTimeout: this._connectionTimeout,
        proxy: this._proxy
    });

    let self = this;

    this._rtmClient.connect();

    this._rtmClient.on('connect', function() {

        self._processor.on(RTMConfig.SERVER_PUSH.kickOut, function(data) {
            
            self._isClose = true;
            self._rtmClient.close();
        });

        auth.call(self, timeout);
    });

    this._rtmClient.on('close', function() {

        self._rtmClient.removeEvent();
        onClose.call(self);
        reConnect.call(self);
    });

    this._rtmClient.on('error', function(err) {
        
        self.emit('error', err);
    });

    this._rtmClient.processor = this._processor;
}

function auth(timeout) {

    let payload = {
        pid: this._pid,
		uid: this._uid,
		token: this._token,
		version: this._version,
		unread: this._recvUnreadMsgStatus
    };

    let options = {
        flag: 1,
        method: 'auth',
        payload: RTMConfig.MsgPack.encode(payload, this._msgOptions)
    };

    let self = this;

    sendQuest.call(this, this._rtmClient, options, function(err, data) {
        
        if (data && data.ok) {

            if (self._reconnectID) {

                clearTimeout(self._reconnectID);
                self._reconnectID = 0;
            }

            self.emit('login', { endpoint: self._endpoint });
            return;
        }

        if (data && !data.ok) {

            if (data.gate) {
                
                self._endpoint = data.gate;
                self._rtmClient.close();
                return;
            }

            self.emit('error', new Error('token error!'));
            self.emit('login', { error: data });
        }

        if (err) {

            self._rtmClient.close(err);
        }
    }, timeout);
}

function onClose() {

    if (this._reconnectID) {

        clearTimeout(this._reconnectID);
        this._reconnectID = 0;
    }

    this.emit('close', !this._isClose && this._autoReconnect);
}

function reConnect() {

    if (!this._autoReconnect) {

        return;
    }

    if (this._reconnectID) {

        return;
    }

    if (this._isClose) {

        return;
    }

    let self = this;

    this._reconnectID = setTimeout(function() {

        self.login(self._endpoint, self._ipv6);
    }, 100);
}

module.exports = { RTMClient, RTMConfig };
