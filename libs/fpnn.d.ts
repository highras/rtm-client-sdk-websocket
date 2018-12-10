declare module fpnn {
    export class FPClient {
        constructor(options);
        processor;
        connect();
        sendQuest(options, callback, timeout);
        sendNotify(options);
        close(err);
        isOpen;
        hasConnect;
        destroy();
        on(type, callback);
        emit();
        removeEvent();
    }

    export class FPConfig {
        static BUFFER;
        static ERROR_CODE;
        static FP_FLAG;
        static FP_MESSAGE_TYPE;
        static TCP_MAGIC;
        static HTTP_MAGIC;
        static FPNN_VERSION;
        static READ_BUFFER_LEN;
        static CHECK_CBS_INTERVAL;
        static SEND_TIMEOUT;
    }

    export class FPEvent {
        static assign(target);
    }

    export class FPSocket {
        constructor(options);
        endpoint;
        open();
        write(buf);
        isOpen;
        isConnecting;
        close(err);
        destroy();
        on(type, callback);
        emit();
        removeEvent();
    }

    export class FPPackage {
        constructor();
        buildPkgData(options);
        cbKey(data);
        isHTTP(data);
        isTCP(data);
        isMsgPack(data);
        isJson(data);
        isOneWay(data);
        isTwoWay(data);
        isQuest(data);
        isAnswer(data);
        isSupportPack(data);
        enCode(data);
        enCodeOneway(data);
        enCodeTwoway(data);
        enCodeAnswer(data);
        peekHead(buf);
        deCode(buf);
        deCodeOneWay(buf, data);
        deCodeTwoWay(buf, data);
        deCodeAnswer(buf, data);
    }

    export class FPCallback {
        constructor();
        addCb(key, cb, timeout);
        removeCb(key);
        execCb(key, data);
    }

    export class FPProcessor {
        constructor();
        service(data, cb);
        destroy();
        on(type, callback);
        emit();
        removeEvent();
    }

    export class BrowserImpl {
        constructor();
        open(endpoint);
        send(data);
        close();
        isOpen;
        isConnecting;
        on(type, callback);
        emit();
        removeEvent();
    }

    export class WechatImpl {
        constructor();
        open(endpoint);
        send(data);
        close();
        isOpen;
        isConnecting;
        on(type, callback);
        emit();
        removeEvent();
    }
}