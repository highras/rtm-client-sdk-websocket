'use strict'

const API_VERSION = '2.1.0';
const SDK_VERSION = '1.0.9';

const ERROR_CODE = {
	RTM_EC_INVALID_PROJECT_ID_OR_USER_ID: 200001,
	RTM_EC_INVALID_PROJECT_ID_OR_SIGN: 200002,
	RTM_EC_INVALID_FILE_OR_SIGN_OR_TOKEN: 200003,
	RTM_EC_ATTRS_WITHOUT_SIGN_OR_EXT: 200004,

	RTM_EC_API_FREQUENCY_LIMITED: 200010,
	RTM_EC_MESSAGE_FREQUENCY_LIMITED: 200011,

	RTM_EC_FORBIDDEN_METHOD: 200020,
	RTM_EC_PERMISSION_DENIED: 200021,
	RTM_EC_UNAUTHORIZED: 200022,
	RTM_EC_DUPLCATED_AUTH: 200023,
	RTM_EC_AUTH_DENIED: 200024,
	RTM_EC_ADMIN_LOGIN: 200025,
	RTM_EC_ADMIN_ONLY: 200026,

	RTM_EC_LARGE_MESSAGE_OR_ATTRS: 200030,
	RTM_EC_LARGE_FILE_OR_ATTRS: 200031,
	RTM_EC_TOO_MANY_ITEMS_IN_PARAMETERS: 200032,
	RTM_EC_EMPTY_PARAMETER: 200033,

	RTM_EC_NOT_IN_ROOM: 200040,
	RTM_EC_NOT_GROUP_MEMBER: 200041,
	RTM_EC_MAX_GROUP_MEMBER_COUNT: 200042,
	RTM_EC_NOT_FRIEND: 200043,
	RTM_EC_BANNED_IN_GROUP: 200044,
	RTM_EC_BANNED_IN_ROOM: 200045,
	RTM_EC_EMPTY_GROUP: 200046,
	RTM_EC_ENTER_TOO_MANY_ROOMS: 200047,

	RTM_EC_UNSUPPORTED_LANGUAGE: 200050,
	RTM_EC_EMPTY_TRANSLATION: 200051,
	RTM_EC_SEND_TO_SELF: 200052,
	RTM_EC_DUPLCATED_MID: 200053,
	RTM_EC_SENSITIVE_WORDS: 200054,

	RTM_EC_UNKNOWN_ERROR: 200999
};

const FILE_TYPE = {
	image: 40, 			//图片
	audio: 41,  		//语音
	video: 42, 			//视频
	file: 50 			//泛指文件，服务器会修改此值（如果服务器可以判断出具体类型的话，仅在mtype=50的情况下）
};

const CHAT_TYPE = {
	text: 30,
	audio: 31,
	cmd: 32
};

const SERVER_PUSH = {
	kickOut: 'kickout',
	kickOutRoom: 'kickoutroom',
	recvMessage: 'pushmsg',
	recvGroupMessage: 'pushgroupmsg',
	recvRoomMessage: 'pushroommsg',
	recvBroadcastMessage: 'pushbroadcastmsg',
	recvFile: 'pushfile',
	recvGroupFile: 'pushgroupfile',
	recvRoomFile: 'pushroomfile',
	recvBroadcastFile: 'pushbroadcastfile',
	recvPing: 'ping',
	recvChat: 'pushchat',
	recvAudio: 'pushaudio',
	recvCmd: 'pushcmd',
	recvGroupChat: 'pushgroupchat',
	recvGroupAudio: 'pushgroupaudio',
	recvGroupCmd: 'pushgroupcmd',
	recvRoomChat: 'pushroomchat',
	recvRoomAudio: 'pushroomaudio',
	recvRoomCmd: 'pushroomcmd',
	recvBroadcastChat: 'pushbroadcastchat',
	recvBroadcastAudio: 'pushbroadcastaudio',
	recvBroadcastCmd: 'pushbroadcastcmd'
};

class RTMConfig {

	static get Int64() {

		return Int64BE;
	}

	static get MsgPack() {

		return msgpack;
	}

	static get FILE_TYPE() {

		return FILE_TYPE;
	}

	static get CHAT_TYPE() {

		return CHAT_TYPE;
	}

	static get SERVER_PUSH() {
		
		return SERVER_PUSH;
	}

	static get MID_TTL() {

		return 5 * 1000;
	}

	static get API_VERSION() {
		return API_VERSION;
	}

	static get SDK_VERSION() {
		return SDK_VERSION;
	}
}

module.exports = RTMConfig;