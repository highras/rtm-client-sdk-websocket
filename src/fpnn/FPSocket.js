'use strict'

const FPConfig = require('./FPConfig');
const FPEvent = require('./FPEvent');

class FPSocket{
    constructor(options){
        FPEvent.assign(this);

        this._endpoint = options ? options.endpoint : null;
        this._connectionTimeout = options ? options.connectionTimeout : 30 * 1000;

        if (this._connectionTimeout === undefined){
            this._connectionTimeout = 30 * 1000;
        }

        this._client = null;
        this._isConnect = false;
        this._connecting = false;

        this._timoutID = 0;
    }

    get endpoint(){ 
        return this._endpoint; 
    }

    write(buf){
        if (buf){
            let arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            this._client.send(arrayBuffer);
        }
    }

    close(err){
        if (err){
            this.emit('error', err);
        }
        onClose.call(this);
    }

    open(){
        if (this.isConnecting || this.isOpen || this._client || !this._endpoint){
            this.emit('error', { code:FPConfig.ERROR_CODE.FPNN_EC_CORE_INVALID_CONNECTION, ex:'FPNN_EC_CORE_INVALID_CONNECTION' });
            return;
        }

        let self = this;
        this._connecting = true;

        try {
            this._client = new WebSocket(this._endpoint);
        } catch (err) {
            onError.call(self, err);
            onClose.call(self);
            return;
        }

        this._client.binaryType = 'arraybuffer';

        this._timoutID = setTimeout(() => {
            if (self.isConnecting){
                onError.call(self, { code:FPConfig.ERROR_CODE.FPNN_EC_CORE_TIMEOUT, ex:'FPNN_EC_CORE_TIMEOUT' }); 
                onClose.call(self);
            }
        }, this._connectionTimeout);

        this._client.onopen = (evt) => { 
            onConnect.call(self);
        };
          
        this._client.onmessage = (evt) => {
            onData.call(self, evt.data);
        };
          
        this._client.onclose = (evt) => {
            onClose.call(self);
        };      

        this._client.onerror = (evt) => {
            onError.call(self, evt);
        };
    }

    get isOpen(){
        return this._isConnect;
    }

    get isConnecting(){
        return this._connecting;
    }
}

function onData(chunk){
    this.emit('data', chunk);
}

function onConnect(){
    this._isConnect = true;
    this._connecting = false;

    this.emit('connect');
}

function onClose(){
    if (this._timoutID){
        clearTimeout(this._timoutID);
        this._timoutID = 0;
    }

    if (this._client){
        this._client.close();
        this._client = null;
    }

    this._isConnect = false;
    this._connecting = false;

    this.emit('close');
}

function onError(err){
    this.emit('error', err);
}

module.exports = FPSocket;