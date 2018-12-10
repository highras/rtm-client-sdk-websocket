declare module rtm {
    export class RTMClient {
        constructor(options);
        processor;
        login(endpoint, ipv6);
        destroy();
        sendMessage(to, mtype, msg, attrs, mid, timeout, callback);
        sendGroupMessage(gid, mtype, msg, attrs, mid, timeout, callback);
        sendRoomMessage(rid, mtype, msg, attrs, mid, timeout, callback);
        getUnreadMessage(timeout, callback);
        cleanUnreadMessage(timeout, callback);
        getSession(timeout, callback);
        getGroupMessage(gid, desc, num, begin, end, lastid, timeout, callback);
        getRoomMessage(rid, desc, num, begin, end, lastid, timeout, callback);
        getBroadcastMessage(desc, num, begin, end, lastid, timeout, callback);
        getP2PMessage(ouid, desc, num, begin, end, lastid, timeout, callback);
        fileToken(cmd, tos, to, rid, gid, timeout, callback);
        close();
        addAttrs(attrs, timeout, callback);
        getAttrs(timeout, callback);
        addDebugLog(msg, attrs, timeout, callback);
        addDevice(apptype, devicetoken, timeout, callback);
        removeDevice(devicetoken, timeout, callback);
        setTranslationLanguage(targetLanguage, timeout, callback);
        translate(originalMessage, originalLanguage, targetLanguage, timeout, callback);
        addFriends(friends, timeout, callback);
        deleteFriends(friends, timeout, callback);
        getFriends(timeout, callback);
        addGroupMembers(gid, uids, timeout, callback);
        deleteGroupMembers(gid, uids, timeout, callback);
        getGroupMembers(gid, timeout, callback);
        getUserGroups(timeout, callback);
        enterRoom(rid, timeout, callback);
        leaveRoom(rid, timeout, callback);
        getUserRooms(timeout, callback);
        getOnlineUsers(uids, timeout, callback);
        deleteMessage(mid, xid, type, timeout, callback);
        kickout(ce, timeout, callback);
        dbGet(key, timeout, callback);
        dbSet(key, value, timeout, callback);
        sendFile(mtype, to, file, mid, timeout, callback);
        sendGroupFile(mtype, gid, file, mid, timeout, callback);
        sendRoomFile(mtype, rid, file, mid, timeout, callback);
        on(type, callback);
        emit();
        removeEvent();
    }

    export class RTMConfig {
        static Int64;
        static MsgPack;
        static FILE_TYPE;
        static SERVER_PUSH;
        static MID_TTL;
    }

    export class RTMProcessor {
        constructor();
        service(data, cb);
        destroy();
        kickout(data);
        kickoutroom(data);
        pushmsg(data);
        pushgroupmsg(data);
        pushroommsg(data);
        pushbroadcastmsg(data);
        ping(data);
        on(type, callback);
        emit();
        removeEvent();
    }

    export class RTMProxy {
        constructor(endpoint);
        endpoint;
        targetEndpoint;
        buildProxyData(data);
    }
}