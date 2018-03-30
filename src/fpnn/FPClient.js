'use strict'

const Buffer = require('buffer/').Buffer;

const FPConfig = require('./FPConfig');
const FPEvent = require('./FPEvent');
const FPSocket = require('./FPSocket');
const FPPackage = require('./FPPackage');
const FPCallback = require('./FPCallback');
const FPProcessor = require('./FPProcessor');

class FPClient{
    constructor(options){
        FPEvent.assign(this);

        this._buffer = Buffer.allocUnsafe(16);
        this._autoReconnect = options ? options.autoReconnect : false;
        this._proxy = options ? options.proxy : null;

        if (this._proxy){
            this._proxy.targetEndpoint = options.endpoint;
            options.endpoint = this._proxy.endpoint;
        }

        this._conn = new FPSocket(options);

        let self = this;
        this._conn.on('connect', function(){
            onConnect.call(self);
        });

        this._conn.on('close', function(){
            onClose.call(self);
        });

        this._conn.on('data', function(chunk){
            onData.call(self, chunk);
        });

        this._conn.on('error', function(err){
            self.emit('error', err);
        });

        this._pkg = new FPPackage();
        this._cbs = new FPCallback();
        this._psr = new FPProcessor();

        this._seq = 0;
        this._wpos = 0;
        this._peekData = null;

        this._timeoutID = 0;

        this._buffer = Buffer.allocUnsafe(FPConfig.READ_BUFFER_LEN);
    }

    get processor(){
        return this._psr;
    }

    set processor(value){
        return this._psr = value;
    }

    connect(){
        if (this.hasConnect){
            this._conn.close();
            return;
        }

        this._conn.open();
    }

    sendQuest(options, callback, timeout){
        if (!this.isOpen){
            this.emit('error', 'no connect')
            return;
        }

        let data = {};

        data.magic = options.magic !== undefined ? options.magic : FPConfig.TCP_MAGIC;
        data.version = options.version !== undefined ? options.version : 1;
        data.flag = options.flag !== undefined ? options.flag : 0;
        data.mtype = options.mtype !== undefined ? options.mtype : 1;

        data.method = options.method;
        data.seq = (options.seq === undefined) ? ++this._seq : options.seq;
        data.payload = options.payload;

        data = this._pkg.buildPkgData(data);
        if (callback) this._cbs.addCb(this._pkg.cbKey(data), callback, timeout);

        let buf = this._pkg.enCode(data);

        if (this._proxy){
            buf = this._proxy.buildProxyData(buf);
        }

        this._conn.write(buf);
    }

    sendNotify(options){
        if (!this.isOpen){
            this.emit('error', 'no connect')
            return;
        }

        let data = {};

        data.magic = options.magic !== undefined ? options.magic : FPConfig.TCP_MAGIC;
        data.version = options.version !== undefined ? options.version : 1;
        data.flag = options.flag !== undefined ? options.flag : 0;
        data.mtype = options.mtype !== undefined ? options.mtype : 0;

        data.method = options.method;
        data.payload = options.payload;

        data = this._pkg.buildPkgData(data);
        let buf = this._pkg.enCode(data);

        if (this._proxy){
            buf = this._proxy.buildProxyData(buf);
        }

        this._conn.write(buf);
    }

    close(){
        this._conn.close();
    }

    get isOpen(){
        return this._conn.isOpen;
    }

    get hasConnect(){
        return this._conn.isOpen || this._conn.isConnecting;
    }
}

function onConnect(){
    if (this._timeoutID){
        clearTimeout(this._timeoutID);
        this._timeoutID = 0;
    }

    this.emit('connect');
}

function onClose(){
    if (this._timeoutID){
        clearTimeout(this._timeoutID);
        this._timeoutID = 0;
    }

    if (this._autoReconnect){
        let self = this;
        this._timeoutID = setTimeout(function(){
            self.connect();
        }, FPConfig.SEND_TIMEOUT);
    }

    this._seq = 0;
    this._wpos = 0;
    this._peekData = null;

    this._buffer = Buffer.allocUnsafe(FPConfig.READ_BUFFER_LEN);
    this._cbs.removeCb();

    this.emit('close');
}

function onData(chunk){
    chunk = Buffer.from(chunk);

    if (this._wpos + chunk.length > this._buffer.length){
        let buf = Buffer.allocUnsafe(this._wpos + chunk.length);
        this._buffer.copy(buf, 0, 0, this._wpos);
        this._buffer = buf;
    }

    this._wpos += chunk.copy(this._buffer, this._wpos, 0);

    if (!this._peekData){

        this._peekData = peekHead.call(this, this._buffer);

        if (!this._peekData){
            this._conn.close({ code:FPConfig.ERROR_CODE.FPNN_EC_CORE_CONNECTION_CLOSED, ex:'FPNN_EC_CORE_CONNECTION_CLOSED' });
            return;
        }
    }

    let diff = this._wpos - this._peekData.pkgLen;
    if (diff >= 0){
        let mbuf = Buffer.allocUnsafe(this._peekData.pkgLen);
        this._buffer.copy(mbuf, 0, 0, this._peekData.pkgLen);

        let len = Math.max(2 * (this._wpos - this._peekData.pkgLen), FPConfig.READ_BUFFER_LEN);
        let buf = Buffer.allocUnsafe(len);
        this._wpos = this._buffer.copy(buf, 0, this._peekData.pkgLen, this._peekData.pkgLen + diff);
        this._buffer = buf;

        delete this._peekData;
        this._peekData = null;

        let data = this._pkg.deCode(mbuf);

        if (this._pkg.isAnswer(data)){
            let cbkey = this._pkg.cbKey(data);
            this._cbs.execCb(cbkey, data);
        }

        if (this._pkg.isQuest(data)){
            let self = this;
            this._psr.service(data, function(payload, exception){
                sendAnswer.call(self, data.flag, data.seq, payload, exception);
            });
        }
    }
}

function sendAnswer(flag, seq, payload, exception){
    if (exception === undefined){
        exception = false;
    }

    let options = {
        flag: flag,
        mtype: 2,
        seq: seq,
        ss: exception ? 1 : 0,
        payload: payload,
    };

    this.sendQuest(options);
}

function peekHead(buf){
    let data = null;

    if (buf.length >= 12){
        data = this._pkg.peekHead(buf);

        if (!checkHead.call(this, data)){
            return null;
        }

        if (this._pkg.isOneWay(data)){
            data.pkgLen = 12 + data.ss + data.psize;
        }

        if (this._pkg.isTwoWay(data)){
            data.pkgLen = 16 + data.ss + data.psize;
        }

        if (this._pkg.isAnswer(data)){
            data.pkgLen = 16 + data.psize;
        }
    }

    return data;
}

function checkHead(data){
    if (!FPConfig.TCP_MAGIC.equals(data.magic) && !FPConfig.HTTP_MAGIC.equals(data.magic)){
        return false;
    }

    if (data.version < 0 || data.version >= FPConfig.FPNN_VERSION.length){
        return false;
    }

    if (data.flag < 0 || data.flag >= FPConfig.FP_FLAG.length){
        return false;
    }
    
    if (data.mtype < 0 || data.mtype >= FPConfig.FP_MESSAGE_TYPE.length){
        return false;
    }

    return true;
}

module.exports = FPClient;