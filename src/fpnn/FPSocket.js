'use strict'

const FPConfig = require('./FPConfig');
const FPEvent = require('./FPEvent');

class FPSocket {

    constructor(options) {

        FPEvent.assign(this);

        this._endpoint = options.endpoint || null;
        this._connectionTimeout = options.connectionTimeout || 10 * 1000;

        this._client = null;
        this._writeID = 0;
        this._timeoutID = 0;
        this._queue = [];
    }

    get endpoint() { 

        return this._endpoint; 
    }

    write(buf) {

        if (buf) {

            let arrayBuffer = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
            this._queue.push(arrayBuffer);
        }

        if (!this._writeID) {

            let self = this;
            this._writeID = setInterval(function () {

                writeSocket.call(self);
            }, 0);
        }
    }

    close(err) {

        if (err) {

            this.emit('error', err);
        }
        
        if (this._client) {

            this._client.close();
        }
    }

    open() {

        if (this.isConnecting || this.isOpen || !this._endpoint) {

            this.emit('error', new Error('has connected or worng endpoint!'));
            return;
        }

        let self = this;

        try {

            this._client = new WebSocket(this._endpoint);
        } catch (err) {

            onError.call(self, err);
            // onClose.call(self);
            return;
        }

        this._client.binaryType = 'arraybuffer';

        if (this._timeoutID) {

            clearTimeout(this._timeoutID);
            this._timeoutID = 0;
        }

        this._timeoutID = setTimeout(function() {

            if (self.isConnecting) {

                self.close(new Error('connect timeout!'));
            }
        }, this._connectionTimeout);

        this._client.onopen = function(evt) { 

            onConnect.call(self);
        };
          
        this._client.onmessage = function(evt) {

            onData.call(self, evt.data);
        };
          
        this._client.onclose = function(evt) {

            onClose.call(self);
        };      

        this._client.onerror = function(evt) {

            onError.call(self, evt);
        };
    }

    get isOpen() {

        if (!this._client) {

            return false;
        }

        return this._client.readyState == WebSocket.OPEN;
    }

    get isConnecting() {

        if (!this._client) {

            return false;
        }

        return this._client.readyState == WebSocket.CONNECTING;
    }
}

function writeSocket() {

    if (!this.isOpen) {

        return;
    }

    while (this._queue.length) {

        try {

            this._client.send(this._queue[0]);
        } catch (err) {

            onError.call(this, err);
            return;
        }

        this._queue.shift();
    }
}

function onData(chunk) {

    this.emit('data', chunk);
}

function onConnect() {
    
    if (this._timeoutID) {

        clearTimeout(this._timeoutID);
        this._timeoutID = 0;
    }

    this.emit('connect');
}

function onClose() {

    if (this._writeID) {

        clearInterval(this._writeID);
        this._writeID = 0;
    }
    
    if (this._timeoutID) {

        clearTimeout(this._timeoutID);
        this._timeoutID = 0;
    }

    this.emit('close');
}

function onError(err) {

    this.emit('error', err);
}

module.exports = FPSocket;