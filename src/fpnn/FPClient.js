'use strict'

const FPConfig = require('./FPConfig');
const FPEvent = require('./FPEvent');
const FPSocket = require('./FPSocket');
const FPPackage = require('./FPPackage');
const FPCallback = require('./FPCallback');
const FPProcessor = require('./FPProcessor');

class FPClient {

    constructor(options) {

        FPEvent.assign(this);

        this._autoReconnect = options.autoReconnect || false;
        this._proxy = options.proxy || null;

        if (this._proxy) {
            
            this._proxy.targetEndpoint = options.endpoint;
            options.endpoint = this._proxy.endpoint;
        }

        this._conn = new FPSocket(options);

        let self = this;

        this._conn.on('connect', function() {

            onConnect.call(self);
        });

        this._conn.on('close', function() {

            onClose.call(self);
        });

        this._conn.on('data', function(chunk) {

            onData.call(self, chunk);
        });

        this._conn.on('error', function(err) {

            onError.call(self, err);
        });

        this._pkg = new FPPackage();
        this._cbs = new FPCallback();
        this._psr = new FPProcessor();

        this._seq = 0;
        this._wpos = 0;
        this._peekData = null;

        this._readID = 0;
        this._reconnectID = 0;
        this._buffer = FPConfig.BUFFER.allocUnsafe(FPConfig.READ_BUFFER_LEN);
    }

    get processor() {

        return this._psr;
    }

    set processor(value) {

        return this._psr = value;
    }

    connect() {

        if (this.hasConnect) {

            this._conn.close(new Error('has connected!'));
            return;
        }

        this._conn.open();
    }

    sendQuest(options, callback, timeout) {

        let data = {};

        data.magic = options.magic || FPConfig.TCP_MAGIC;
        data.version = options.version || 1;
        data.flag = options.flag || 0;
        data.mtype = options.hasOwnProperty('mtype') ? options.mtype : 1;

        data.method = options.method;
        data.seq = (!options.hasOwnProperty('seq')) ? ++this._seq : options.seq;
        data.payload = options.payload;

        data = this._pkg.buildPkgData(data);

        if (callback) {

            this._cbs.addCb(this._pkg.cbKey(data), callback, timeout);
        }

        let buf = this._pkg.enCode(data);

        if (this._proxy) {

            buf = this._proxy.buildProxyData(buf);
        }

        this._conn.write(buf);
    }

    sendNotify(options) {

        let data = {};

        data.magic = options.magic || FPConfig.TCP_MAGIC;
        data.version = options.version || 1;
        data.flag = options.flag || 0;
        data.mtype = options.mtype || 0;

        data.method = options.method;
        data.payload = options.payload;

        data = this._pkg.buildPkgData(data);
        let buf = this._pkg.enCode(data);

        if (this._proxy) {

            buf = this._proxy.buildProxyData(buf);
        }

        this._conn.write(buf);
    }

    close(err) {

        if (err) {

            onError.call(this, err);
        }

        this._conn.close();
    }

    get isOpen() {

        return this._conn.isOpen;
    }

    get hasConnect() {

        return this._conn.isOpen || this._conn.isConnecting;
    }
}

function onError(err) {
    
    this.emit('error', err);
}

function onConnect() {

    if (this._reconnectID) {

        clearTimeout(this._reconnectID);
        this._reconnectID = 0;
    }

    this.emit('connect');
}

function onClose() {

    if (this._readID) {

        clearInterval(this._readID);
        this._readID = 0;
    }

    if (this._reconnectID) {

        clearTimeout(this._reconnectID);
        this._reconnectID = 0;
    }

    this._seq = 0;
    this._wpos = 0;
    this._peekData = null;

    this._buffer = FPConfig.BUFFER.allocUnsafe(FPConfig.READ_BUFFER_LEN);

    this.emit('close');

    if (this._autoReconnect) {

        reConnect.call(this);
    }
}

function reConnect() {

    if (this._reconnectID) {

        return;
    }

    let self = this;

    this._reconnectID = setTimeout(function() {

        self.connect();
    }, 100);
}

function onData(chunk) {

    chunk = FPConfig.BUFFER.from(chunk);

    let len = this._wpos + chunk.length;

    if (len > this._buffer.length) {

        resizeBuffer.call(this, len, 2 * FPConfig.READ_BUFFER_LEN);
    }

    this._wpos += chunk.copy(this._buffer, this._wpos, 0);

    if (!this._readID) {

        let self = this;
        this._readID = setInterval(function () {

            readPeekData.call(self);
        }, 0);
    }
}

function resizeBuffer(len1, len2, offset=0) {

    let len = Math.max(len1, len2);

    let buf = FPConfig.BUFFER.allocUnsafe(len);
    this._wpos = this._buffer.copy(buf, 0, offset, this._wpos);
    this._buffer = buf;
}

function readPeekData () {

    if (this._wpos < 12) {

        return;
    }

    if (!this._peekData) {

        this._peekData = peekHead.call(this, this._buffer);

        if (!this._peekData) {

            this.conn.close(new Error('worng package!'));
            return;
        }
    }
    
    let diff = this._wpos - this._peekData.pkgLen;

    if (diff < 0) {

        return;
    }

    this._buffer.copy(this._peekData.buffer, 0, 0, this._peekData.pkgLen);

    let data = this._pkg.deCode(this._peekData.buffer);

    resizeBuffer.call(this, 2 * diff, FPConfig.READ_BUFFER_LEN, this._peekData.pkgLen);
    delete this._peekData;
    this._peekData = null;

    if (this._pkg.isAnswer(data)) {

        let cbkey = this._pkg.cbKey(data);
        this._cbs.execCb(cbkey, data);
    }

    if (this._pkg.isQuest(data)) {

        let self = this;
        this._psr.service(data, function(payload, exception) {

            sendAnswer.call(self, data.flag, data.seq, payload, exception);
        });
    }
}

function sendAnswer(flag, seq, payload, exception) {

    exception = exception || false;

    let options = {
        flag: flag,
        mtype: 2,
        seq: seq,
        ss: exception ? 1 : 0,
        payload: payload,
    };

    this.sendQuest(options);
}

function peekHead(buf) {

    let data = null;

    if (buf.length >= 12) {

        data = this._pkg.peekHead(buf);

        if (!checkHead.call(this, data)) {

            return null;
        }

        if (this._pkg.isOneWay(data)) {

            data.pkgLen = 12 + data.ss + data.psize;
        }

        if (this._pkg.isTwoWay(data)) {

            data.pkgLen = 16 + data.ss + data.psize;
        }

        if (this._pkg.isAnswer(data)) {

            data.pkgLen = 16 + data.psize;
        }

        if (data.pkgLen > 0) {

            data.buffer = FPConfig.BUFFER.allocUnsafe(data.pkgLen);
        }
    }

    return data;
}

function checkHead(data) {

    if (!FPConfig.TCP_MAGIC.equals(data.magic) && !FPConfig.HTTP_MAGIC.equals(data.magic)) {

        return false;
    }

    if (data.version < 0 || data.version >= FPConfig.FPNN_VERSION.length) {

        return false;
    }

    if (data.flag < 0 || data.flag >= FPConfig.FP_FLAG.length) {

        return false;
    }
    
    if (data.mtype < 0 || data.mtype >= FPConfig.FP_MESSAGE_TYPE.length) {

        return false;
    }

    return true;
}

module.exports = FPClient;