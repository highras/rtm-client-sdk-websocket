'use strict'

class BrowserImpl {

	constructor() {

		this._socket = null;
	}

	open(endpoint) {

        let self = this;

		try {

            this._socket = new WebSocket(endpoint);
        } catch (err) {

            this.emit('error', err);
            return;
        }

        this._socket.binaryType = 'arraybuffer';

        this._socket.onopen = function(evt) { 

            self.emit('open');
        };
          
        this._socket.onmessage = function(evt) {

            self.emit('message', evt.data);
        };
          
        this._socket.onclose = function(evt) {

            self.emit('close');
        };      

        this._socket.onerror = function(evt) {

            self.emit('error', evt);
        };
	}

	send(data) {

		try {

            this._socket.send(data);
        } catch (err) {

            this.emit('error', err);
            return;
        }
	}

	close() {

		if (this._socket) {

			this._socket.close();
		}
	}

	get isOpen() {

		if (this._socket) {

	        return this._socket.readyState == WebSocket.OPEN;
        }

        return false;
	}

	get isConnecting() {

		if (this._socket) {

	        return this._socket.readyState == WebSocket.CONNECTING;
        }

        return false;
	}
}

module.exports = BrowserImpl;
