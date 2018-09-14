'use strict'

const FPEvent = require('./FPEvent');

class FPProcessor {

    constructor() {

        FPEvent.assign(this);
    }

    service(data, cb) {

        this.emit(data.method, data.payload, cb);
    }

    destroy() {

        this.removeEvent();
    }
}

module.exports = FPProcessor;