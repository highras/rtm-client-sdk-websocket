'use strict'

const FPConfig = require('../fpnn/FPConfig');
const FPEvent = require('../fpnn/FPEvent');
const FPClient = require('../fpnn/FPClient');
const RTMConfig = require('./RTMConfig');
const RTMProcessor = require('./RTMProcessor');
const RTMProxy = require('./RTMProxy');
const MD5 = require('../lib/md5');

class RTMClient{
    /**
     * 
     * @param {object} options 
     * 
     * options:
     * {string} options.dispatch
     * {number} options.pid 
     * {Int64BE} options.uid
     * {string} options.token
     * {bool} options.autoReconnect 
     * {number} options.connectionTimeout 
     * {string} options.version
     * {bool} options.recvUnreadMsgStatus
     * {bool} options.ssl
     * {string} options.proxyEndpoint
     */
    constructor(options){
        FPEvent.assign(this);

        this._dispatch = options.dispatch;
        this._pid = options.pid;
        this._uid = options.uid;
        this._token = options.token;
        this._version = options.version;
        this._recvUnreadMsgStatus = options.recvUnreadMsgStatus !== undefined ? options.recvUnreadMsgStatus : true;
        this._ssl = options.ssl !== undefined ? options.ssl : true;
        this._autoReconnect = options.autoReconnect !== undefined ? options.autoReconnect : true;
        this._connectionTimeout = options.connectionTimeout ? options.connectionTimeout : 30 * 1000;

        if (this._ssl){
            this._proxyEndpoint = options.proxyEndpoint; 
        }

        this._midSeq = 0;
        this._saltSeq = 0;
        this._loginCount = 0;
        this._endpoint = null;
        this._ipv6 = false;

        this._client = null;
        this._loginOptions = null; 
        this._timeoutID = 0;

        this._isClose = false;

        this._msgOptions = {
            codec: msgpack.createCodec({  
                int64: true
            }) 
        };

        this._logining = false;
        this._authed = false;

        this._processor = new RTMProcessor(this._msgOptions);

        if (this._proxyEndpoint){
            let endpoint = buildEndpoint.call(this, this._proxyEndpoint);
            this._proxy = new RTMProxy(endpoint);
        }
    }

    get authed(){
        return this._authed;
    }

    /**
     * 
     * @param {string} endpoint
     * @param {bool} ipv6 
     */
    login(endpoint, ipv6){
        if (this._authed){
            return;
        }

        this._endpoint = endpoint ? endpoint : null;
        this._ipv6 = ipv6 !== undefined ? ipv6 : false;
        this._isClose = false;

        if (this._endpoint){
            connectRTMGate.call(this);
            return;
        }

        if (this._logining){
            return;
        }

        this._logining = true;

        let self = this;

        getRTMGate.call(this, 'rtmGated', function(err, data){
            if (data){
                setTimeout(function(){
                    self._loginCount++;
                    self.login(data.endpoint, self._ipv6);
                }, self._loginCount * 1000);
                return;
            }

            if (err){
                self.emit('error', err);
            }

            onClose.call(self);
        });
    }

    /**
     * 
     * @param {Int64BE} to 
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    sendMessage(to, mtype, msg, attrs, callback, timeout){
        if (attrs === undefined){
            attrs = '';
        }

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
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64BE>} tos
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    sendMessages(tos, mtype, msg, attrs, callback, timeout){
        if (attrs === undefined){
            attrs = '';
        }

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
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    sendGroupMessage(gid, mtype, msg, attrs, callback, timeout){
        if (attrs === undefined){
            attrs = '';
        }

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
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} rid
     * @param {number} mtype 
     * @param {string} msg 
     * @param {string} attrs 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    sendRoomMessage(rid, mtype, msg, attrs, callback, timeout){
        if (attrs === undefined){
            attrs = '';
        }

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
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     */
    close(){
        let payload = {};

        let options = {
            flag: 1,
            method: 'bye',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        let self = this;

        sendQuest.call(this, this._client, options, function(err, data){
            self._client.close();
        });
    }

    /**
     * 
     * @param {object} dict 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    addVariables(dict, callback, timeout){
        let payload = {
            var: dict
        };

        let options = {
            flag: 1,
            method: 'addvariables',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64BE>} friends 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    addFriends(friends, callback, timeout){
        let payload = {
            friends: friends
        };

        let options = {
            flag: 1,
            method: 'addfriends',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64BE>} friends 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    deleteFriends(friends, callback, timeout){
        let payload = {
            friends: friends
        };

        let options = {
            flag: 1,
            method: 'delfriends',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Int64BE>} data
     */
    getFriends(callback, timeout){
        let payload = {};

        let options = {
            flag: 1,
            method: 'getfriends',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids){
                let buids = [];
                uids.forEach(function(item, index){
                    buids[index] = new Int64BE(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {array<Int64BE>} uids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    addGroupMembers(gid, uids, callback, timeout){
        let payload = {
            gid: gid,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'addgroupmembers',
            payload: msgpack.encode(payload, this._msgOptions)
        };
        
        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {array<Int64BE>} uids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    deleteGroupMembers(gid, uids, callback, timeout){
        let payload = {
            gid: gid,
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'delgroupmembers',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Int64BE>} data
     */
    getGroupMembers(gid, callback, timeout){
        let payload = {
            gid: gid
        };

        let options = {
            flag: 1,
            method: 'getgroupmembers',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids){
                let buids = [];
                uids.forEach(function(item, index){
                    buids[index] = new Int64BE(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Int64BE>} data
     */
    getUserGroups(callback, timeout){
        let payload = {};

        let options = {
            flag: 1,
            method: 'getusergroups',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let gids = data['gids'];
            if (gids){
                let bgids = [];
                gids.forEach(function(item, index){
                    bgids[index] = new Int64BE(item);
                });

                callback(null, bgids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} rid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    enterRoom(rid, callback, timeout){
        let payload = {
            rid: rid
        };

        let options = {
            flag: 1,
            method: 'enterroom',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {Int64BE} rid 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data
     */
    leaveRoom(rid, callback, timeout){
        let payload = {
            rid: rid
        };

        let options = {
            flag: 1,
            method: 'leaveroom',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Int64BE>} data
     */
    getUserRooms(callback, timeout){
        let payload = {};

        let options = {
            flag: 1,
            method: 'getuserrooms',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let rids = data['rooms'];
            if (rids){
                let brids = [];
                rids.forEach(function(item, index){
                    brids[index] = new Int64BE(item);
                });

                callback(null, brids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {array<Int64BE>} uids 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<Int64BE>} data
     */
    getOnlineUsers(uids, callback, timeout){
        let payload = {
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'getonlineusers',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let uids = data['uids'];
            if (uids){
                let buids = [];
                uids.forEach(function(item, index){
                    buids[index] = new Int64BE(item);
                });

                callback(null, buids);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object<uidOfUnreadMessage:array<Int64BE>, gidOfUnreadGroupMessage:array<Int64BE>, haveUnreadBroadcastMessage:bool>} data
     */
    checkUnreadMessage(callback, timeout){
        let payload = {};

        let options = {
            flag: 1,
            method: 'checkunreadmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let uids = data['uidOfUnreadMessage'];
            if (uids){
                let buids = [];
                uids.forEach(function(item, index){
                    buids[index] = new Int64BE(item);
                });
                data.uidOfUnreadMessage = buids;
            }

            let gids = data['gidOfUnreadGroupMessage'];
            if (gids){
                let bgids = [];
                gids.forEach(function(item, index){
                    bgids[index] = new Int64BE(item);
                });
                data.gidOfUnreadGroupMessage = bgids;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {Int64BE} gid 
     * @param {number} num
     * @param {bool} desc 
     * @param {number} page
     * @param {Int64BE} localmid
     * @param {Int64BE} localid
     * @param {array<number>} mtypes
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object<num:number, maxid:Int64BE, msgs:array<GroupMsg>>} data 
     * 
     * <GroupMsg>
     * @param {Int64BE} GroupMsg.id
     * @param {Int64BE} GroupMsg.from
     * @param {number} GroupMsg.mtype
     * @param {number} GroupMsg.ftype
     * @param {Int64BE} GroupMsg.mid
     * @param {string} GroupMsg.msg
     * @param {string} GroupMsg.attrs
     * @param {number} GroupMsg.mtime
     */
    getGroupMessage(gid, num, desc, page, localmid, localid, mtypes, callback, timeout){
        let payload = {
            gid: gid,
            num: num,
            desc: desc,
            page: page
        };

        if (localmid !== undefined){
            payload.localmid = localmid;
        }

        if (localid !== undefined){
            payload.localid = localid;
        }

        if (mtypes !== undefined){
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getgroupmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let msgs = data['msgs'];
            if (msgs){
                let bmsgs = [];
                msgs.forEach(function(item, index){
                    bmsgs[index] = {
                        id: new Int64BE(item[0]),
                        from: new Int64BE(item[1]),
                        mtype: Number(item[2]),
                        ftype: Number(item[i][3]),
                        mid: new Int64BE(item[4]),
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
     * @param {Int64BE} rid 
     * @param {number} num
     * @param {bool} desc 
     * @param {number} page
     * @param {Int64BE} localmid
     * @param {Int64BE} localid
     * @param {array<number>} mtypes
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object<num:number, maxid:Int64BE, msgs:array<RoomMsg>>} data 
     * 
     * <RoomMsg>
     * @param {Int64BE} RoomMsg.id
     * @param {Int64BE} RoomMsg.from
     * @param {number} RoomMsg.mtype
     * @param {number} RoomMsg.ftype
     * @param {Int64BE} RoomMsg.mid
     * @param {string} RoomMsg.msg
     * @param {string} RoomMsg.attrs
     * @param {number} RoomMsg.mtime
     */
    getRoomMessage(rid, num, desc, page, localmid, localid, mtypes, callback, timeout){
        let payload = {
            rid: rid,
            num: num,
            desc: desc,
            page: page
        };

        if (localmid !== undefined){
            payload.localmid = localmid;
        }

        if (localid !== undefined){
            payload.localid = localid;
        }

        if (mtypes !== undefined){
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getroommsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let msgs = data['msgs'];
            if (msgs){
                let bmsgs = [];
                msgs.forEach(function(item, index){
                    bmsgs[index] = {
                        id: new Int64BE(item[0]),
                        from: new Int64BE(item[1]),
                        mtype: Number(item[2]),
                        ftype: Number(item[i][3]),
                        mid: new Int64BE(item[4]),
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
     * @param {Int64BE} localmid
     * @param {Int64BE} localid
     * @param {array<number>} mtypes
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object<num:number, maxid:Int64BE, msgs:array<BroadcastMsg>>} data 
     * 
     * <BroadcastMsg>
     * @param {Int64BE} BroadcastMsg.id
     * @param {Int64BE} BroadcastMsg.from
     * @param {number} BroadcastMsg.mtype
     * @param {number} BroadcastMsg.ftype
     * @param {Int64BE} BroadcastMsg.mid
     * @param {string} BroadcastMsg.msg
     * @param {string} BroadcastMsg.attrs
     * @param {number} BroadcastMsg.mtime
     */
    getBroadcastMessage(num, desc, page, localmid, localid, mtypes, callback, timeout){
        let payload = {
            num: num,
            desc: desc,
            page: page
        };

        if (localmid !== undefined){
            payload.localmid = localmid;
        }

        if (localid !== undefined){
            payload.localid = localid;
        }

        if (mtypes !== undefined){
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getbroadcastmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let msgs = data['msgs'];
            if (msgs){
                let bmsgs = [];
                msgs.forEach(function(item, index){
                    bmsgs[index] = {
                        id: new Int64BE(item[0]),
                        from: new Int64BE(item[1]),
                        mtype: Number(item[2]),
                        ftype: Number(item[i][3]),
                        mid: new Int64BE(item[4]),
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
     * @param {Int64BE} peeruid 
     * @param {number} num
     * @param {number} direction 
     * @param {bool} desc 
     * @param {number} page
     * @param {Int64BE} localmid
     * @param {Int64BE} localid
     * @param {array<number>} mtypes
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object<num:number, maxid:Int64BE, msgs:array<P2PMessage>>} data 
     * 
     * <P2PMessage>
     * @param {Int64BE} P2PMessage.id
     * @param {number} P2PMessage.direction
     * @param {number} P2PMessage.mtype
     * @param {number} P2PMessage.ftype
     * @param {Int64BE} P2PMessage.mid
     * @param {string} P2PMessage.msg
     * @param {string} P2PMessage.attrs
     * @param {number} P2PMessage.mtime
     */
    getP2PMessage(peeruid, num, direction, desc, page, localmid, localid, mtypes, callback, timeout){
        let payload = {
            ouid: peeruid,
            num: num,
            direction: direction,
            desc: desc,
            page: page
        };

        if (localmid !== undefined){
            payload.localmid = localmid;
        }

        if (localid !== undefined){
            payload.localid = localid;
        }

        if (mtypes !== undefined){
            payload.mtypes = mtypes;
        }

        let options = {
            flag: 1,
            method: 'getp2pmsg',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let msgs = data['msgs'];
            if (msgs){
                let bmsgs = [];
                msgs.forEach(function(item, index){
                    bmsgs[index] = {
                        id: new Int64BE(item[0]),
                        direction: Number(item[1]),
                        mtype: Number(item[2]),
                        ftype: Number(item[i][3]),
                        mid: new Int64BE(item[4]),
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
     * @param {string} ptype 
     * @param {string} dtype 
     * @param {string} token 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    addDevice(ptype, dtype, token, callback, timeout){
        let payload = {
            ptype: ptype,
            dtype: dtype,
            token: token
        };

        let options = {
            flag: 1,
            method: 'adddevice',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {string} targetLanguage 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    setTranslationLanguage(targetLanguage, callback, timeout){
        let payload = {
            lang: targetLanguage
        };

        let options = {
            flag: 1,
            method: 'setlang',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {string} originalMessage 
     * @param {string} originalLanguage 
     * @param {string} targetLanguage 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object<stext:string, src:string, dtext:string, dst:string>} data 
     */
    translate(originalMessage, originalLanguage, targetLanguage, callback, timeout){
        let payload = {
            text: originalMessage,
            dst: targetLanguage
        };

        if (originalLanguage !== undefined){
            payload.src = originalLanguage;
        }

        let options = {
            flag: 1,
            method: 'translate',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {string} pushname 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    setPushName(pushname, callback, timeout){
        let payload = {
            pushname: pushname
        };

        let options = {
            flag: 1,
            method: 'setpushname',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {string} data 
     */
    getPushName(callback, timeout){
        let payload = {};

        let options = {
            flag: 1,
            method: 'getpushname',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let pushname = data['pushname'];
            if (pushname !== undefined){
                callback(null, pushname);
                return;
            }

            callback(null, data);
        }, timeout);
    }

    /**
     * 
     * @param {number} lat 
     * @param {number} lng 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    setGeo(lat, lng, callback, timeout){
        let payload = {
            lat: lat,
            lng: lng
        };

        let options = {
            flag: 1,
            method: 'setgeo',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object<lat:number, lng:number>} data 
     */
    getGeo(callback, timeout){
        let payload = {};

        let options = {
            flag: 1,
            method: 'getgeo',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, callback, timeout);
    }

    /**
     * 
     * @param {array<Int64BE>} uids
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {array<array<uid:Int64BE,lat:number,lng:number>>} data 
     */
    getGeos(uids, callback, timeout){
        let payload = {
            uids: uids
        };

        let options = {
            flag: 1,
            method: 'getgeos',
            payload: msgpack.encode(payload, this._msgOptions)
        };

        sendQuest.call(this, this._client, options, function(err, data){
            if (err){
                callback(err, null);
                return;
            }

            let geos = data['geos'];
            if (geos){
                let bgeos = [];
                geos.forEach(function(item, index){
                    item[0] = new Int64BE(item[0]);
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
     * @param {Int64BE} to 
     * @param {File} file
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    sendFile(mtype, to, file, callback, timeout){
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
     * @param {array<Int64BE>} tos 
     * @param {File} file
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    sendFiles(mtype, tos, file, callback, timeout){
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
     * @param {Int64BE} gid 
     * @param {File} file
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    sendGroupFile(mtype, gid, file, callback, timeout){
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
     * @param {Int64BE} rid 
     * @param {File} file
     * @param {function} callback 
     * @param {number} timeout 
     * 
     * @callback
     * @param {object} err
     * @param {object} data 
     */
    sendRoomFile(mtype, rid, file, callback, timeout){
        let ops = {
            cmd: 'sendroomfile',
            mtype: mtype,
            rid: rid,
            file: file
        };

        fileSendProcess.call(this, ops, callback, timeout);
    }
}

function fileSendProcess(ops, callback, timeout){
    let self = this;
    let reader = new FileReader();

    reader.onload = function(e){
        ops.fileContent = Buffer.from(e.target.result);

        if (!ops.fileContent){
            self.emit('error', { code:RTMConfig.ERROR_CODE.RTM_EC_EMPTY_PARAMETER, ex:'RTM_EC_EMPTY_PARAMETER' });
            return;
        }

        filetoken.call(self, ops, function(err, data){
            if (err){
                self.emit('error', err);
                return;
            }

            let token = data["token"];
            let endpoint = data["endpoint"];

            let ext = null;

            if (!ext){
                let extIdx = ops.file.name.lastIndexOf('.');
                if (extIdx > 0 && extIdx < ops.file.name.length - 1){
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
            client.on('connect', function(){
                let options = {
                    method: ops.cmd,
                    token: token,
                    from: self._uid,
                    mtype: ops.mtype,
                    sign: sign,
                    ext: ext,
                    data: ops.fileContent
                };
                if (ops.tos !== undefined){
                    options.tos = ops.tos;
                }
            
                if (ops.to !== undefined){
                    options.to = ops.to;
                }
            
                if (ops.rid !== undefined){
                    options.rid = ops.rid;
                }
            
                if (ops.gid !== undefined){
                    options.gid = ops.gid;
                }
                fileSend.call(self, client, options, callback, timeout);
            });
            client.on('error', function(err){
                self.emit('error', { src: 'file client', err: err });
            });
        }, timeout);
    }
    reader.readAsArrayBuffer(ops.file);
}

function filetoken(ops, callback, timeout){
    let payload = {
        cmd: ops.cmd
    };

    if (ops.tos !== undefined){
		payload.tos = ops.tos;
    }

	if (ops.to !== undefined){
		payload.to = ops.to;
    }

	if (ops.rid !== undefined){
		payload.rid = ops.rid;
    }

	if (ops.gid !== undefined){
		payload.gid = ops.gid;
    }

    let options = {
        flag: 1,
        method: 'filetoken',
        payload: msgpack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, this._client, options, callback, timeout);
}

function fileSend(client, ops, callback, timeout){
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
        payload: msgpack.encode(payload, this._msgOptions)
    };

    sendQuest.call(this, client, options, callback, timeout);
}

function genMid(){
    let timestamp = Math.floor(Date.now() / 1000);
    return new Int64BE(timestamp, this._midSeq++);
}

function cyrMD5(data){
    return MD5(data);
}

function isException(data){
    if (data === undefined){
        return false;
    }
    return data.hasOwnProperty('code') && data.hasOwnProperty('ex');
}

function sendQuest(client, options, callback, timeout){
    let self = this;
    client.sendQuest(options, function(data){
        if (!callback){
            return;
        }

        if (data.payload){
            let payload = msgpack.decode(data.payload, self._msgOptions);
            if (isException.call(self, payload)){
                callback(payload, null);
                return;
            }

            callback(null, payload);
            return;
        }

        callback(null, data);
    }, timeout);
}

function getRTMGate(service, callback){
	let self = this;

	let client = new FPClient({
        endpoint: buildEndpoint.call(this, this._dispatch),
        autoReconnect: false,
        connectionTimeout: this._connectionTimeout,
        proxy: this._proxy
    });

    client.connect();

    client.on('connect', function(){
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
            payload: msgpack.encode(payload, self._msgOptions)
        };
    
        sendQuest.call(self, client, options, callback);
    });

    client.on('error', function(err){
        self.emit('error', err);
    });
}

function buildEndpoint(endpoint){
    if (this._proxy){
        return endpoint;
    }

    let protol = 'ws://';

    if (this._ssl){
        protol = 'wss://';
    }

    return protol + endpoint + '/service/websocket';
}

function connectRTMGate(){
    this._client = new FPClient({ 
        endpoint: buildEndpoint.call(this, this._endpoint), 
        autoReconnect: false,
        connectionTimeout: this._connectionTimeout,
        proxy: this._proxy
    });

    let self = this;

    this._client.connect();

    this._client.on('connect', function(){
        auth.call(self);
    });

    this._client.on('close', function(){
        onClose.call(self);
    });

    this._client.on('error', function(err){
        self._endpoint = null;
        self.emit('error', err);
    });

    this._client.processor = this._processor;
}

function auth(){
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
        payload: msgpack.encode(payload, this._msgOptions)
    };

    let self = this;

    sendQuest.call(this, this._client, options, function(err, data){
        if (data && data.ok){
            self._loginCount = 0;
            self._authed = true;

            self._processor.on(RTMConfig.SERVER_PUSH.kickOut, function(data){
                self._isClose = true;
            });

            if (self._timeoutID){
                clearTimeout(self._timeoutID);
                self._timeoutID = 0;
            }

            self.emit('login', { 
                endpoint: self._endpoint, 
                processor: self._processor, 
                services: RTMConfig.SERVER_PUSH
            });

            return;
        }

        if (data && !data.ok){
            if (data.gate){
                self._client.close();
                self.login(data.gate, self._ipv6); 
                return;
            }

            self.emit('error', data);
        }

        if (err){
            self.emit('error', err);
        }

        self._endpoint = null;
        onClose.call(self);
    });
}

function onClose(){
    this._logining = false;
    this._authed = false;

    if (this._timeoutID){
        clearTimeout(this._timeoutID);
        this._timeoutID = 0;
    }

    this.emit('close');

    if (this._isClose){
        return;
    }

    if (this._autoReconnect){
        let self = this;
        this._timeoutID = setTimeout(function(){
            self.login(self._endpoint, self._ipv6);
        }, FPConfig.SEND_TIMEOUT);
    }
}

module.exports = RTMClient;