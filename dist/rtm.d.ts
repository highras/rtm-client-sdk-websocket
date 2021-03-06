declare module rtm {
    export class RTMClient {
        constructor(options);
        processor;
        updateToken(token);
        login(endpoint, ipv6);
        destroy();
        sendMessage(to, mtype, msg, attrs, mid, timeout, callback);
        sendGroupMessage(gid, mtype, msg, attrs, mid, timeout, callback);
        sendRoomMessage(rid, mtype, msg, attrs, mid, timeout, callback);
        getUnreadMessage(clear, timeout, callback);
        getP2PUnreadMessageNum(uids, mtime, mtypes, timeout, callback);
        getGroupUnreadMessageNum(gids, mtime, mtypes, timeout, callback);
        cleanUnreadMessage(timeout, callback);
        getSession(timeout, callback);
        getGroupMessage(gid, desc, num, begin, end, lastid, mtypes, timeout, callback);
        getRoomMessage(rid, desc, num, begin, end, lastid, mtypes, timeout, callback);
        getBroadcastMessage(desc, num, begin, end, lastid, mtypes, timeout, callback);
        getP2PMessage(ouid, desc, num, begin, end, lastid, mtypes, timeout, callback);
        fileToken(cmd, tos, to, rid, gid, timeout, callback);
        close();
        addAttrs(attrs, timeout, callback);
        getAttrs(timeout, callback);
        addDebugLog(msg, attrs, timeout, callback);
        addDevice(apptype, devicetoken, timeout, callback);
        removeDevice(devicetoken, timeout, callback);
        setTranslationLanguage(targetLanguage, timeout, callback);
        translate(originalMessage, originalLanguage, targetLanguage, type, profanity, timeout, callback);
        profanity(text, classify, timeout, callback);
        textCheck(text, timeout, callback);
        imageCheck(image, type, timeout, callback);
        audioCheck(audio, type, lang, codec, srate, timeout, callback);
        videoCheck(video, type, videoName, timeout, callback);
        speech2Text(audio, type, lang, codec, srate, timeout, callback);
        getGroupsOpenInfo(gids, timeout, callback);
        getRoomsOpenInfo(rids, timeout, callback);
        getRoomMembers(rid, timeout, callback);
        getRoomCount(rids, timeout, callback);
        addDevicePushOption(type, xid, mtypes, timeout, callback);
        removeDevicePushOption(type, xid, mtypes, timeout, callback);
        getDevicePushOption(timeout, callback);
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
		getMessage(mid, xid, type, timeout, callback);
        kickout(ce, timeout, callback);
		sendChat(to, msg, attrs, mid, timeout, callback);
		sendAudio(to, msg, attrs, mid, timeout, callback);
		sendCmd(to, msg, attrs, mid, timeout, callback);
		sendGroupChat(gid, msg, attrs, mid, timeout, callback);
		sendGroupAudio(gid, msg, attrs, mid, timeout, callback);
		sendGroupCmd(gid, msg, attrs, mid, timeout, callback);
		sendRoomChat(rid, msg, attrs, mid, timeout, callback);
		sendRoomAudio(rid, msg, attrs, mid, timeout, callback);
		sendRoomCmd(rid, msg, attrs, mid, timeout, callback);
		getGroupChat(gid, desc, num, begin, end, lastid, timeout, callback);
		getRoomChat(rid, desc, num, begin, end, lastid, timeout, callback);
		getP2PChat(ouid, desc, num, begin, end, lastid, timeout, callback);
		getBroadcastChat(desc, num, begin, end, lastid, timeout, callback);
		deleteChat(mid, xid, type, timeout, callback);
		getChat(mid, xid, type, timeout, callback);
		setUserInfo(oinfo, pinfo, timeout, callback);
		getUserInfo(timeout, callback);
		getUserOpenInfo(uids, timeout, callback);
		setGroupInfo(gid, oinfo, pinfo, timeout, callback);
		getGroupInfo(gid, timeout, callback);
		getGroupOpenInfo(gid, timeout, callback);
		setRoomInfo(rid, oinfo, pinfo, timeout, callback);
		getRoomInfo(rid, timeout, callback);
		getRoomOpenInfo(rid, timeout, callback);
        dataGet(key, timeout, callback);
        dataSet(key, value, timeout, callback);
		dataDelete(key, timeout, callback);
		addBlacks(blacks, timeout, callback);
		deleteBlacks(blacks, timeout, callback);
		getBlacks(timeout, callback);
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
