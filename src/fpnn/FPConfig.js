'use strict'

const Buffer = require('buffer/').Buffer;

const ERROR_CODE = {
	FPNN_EC_PROTO_UNKNOWN_ERROR: 10001,		// 未知错误（协议解析错误）
	FPNN_EC_PROTO_NOT_SUPPORTED: 10002,		// 不支持的协议
	FPNN_EC_PROTO_INVALID_PACKAGE: 10003,	// 无效的数据包
	FPNN_EC_PROTO_JSON_CONVERT: 10004,		// JSON转换错误
	FPNN_EC_PROTO_STRING_KEY: 10005,		// 数据包错误
	FPNN_EC_PROTO_MAP_VALUE: 10006,			// 数据包错误
	FPNN_EC_PROTO_METHOD_TYPE: 10007,		// 请求错误
	FPNN_EC_PROTO_PROTO_TYPE: 10008,		// 协议类型错误
	FPNN_EC_PROTO_KEY_NOT_FOUND: 10009,		// 数据包错误
	FPNN_EC_PROTO_TYPE_CONVERT: 10010,		// 数据包转换错误
			
	FPNN_EC_CORE_UNKNOWN_ERROR: 20001,		// 未知错误（业务流程异常中断）
	FPNN_EC_CORE_CONNECTION_CLOSED: 20002,	// 链接已关闭
	FPNN_EC_CORE_TIMEOUT: 20003,			// 请求超时
	FPNN_EC_CORE_UNKNOWN_METHOD: 20004,		// 错误的请求
	FPNN_EC_CORE_ENCODING: 20005,			// 编码错误
	FPNN_EC_CORE_DECODING: 20006,			// 解码错误
	FPNN_EC_CORE_SEND_ERROR: 20007,			// 发送错误
	FPNN_EC_CORE_RECV_ERROR: 20008,			// 接收错误
	FPNN_EC_CORE_INVALID_PACKAGE: 20009,	// 无效的数据包
	FPNN_EC_CORE_HTTP_ERROR: 20010,			// HTTP错误
	FPNN_EC_CORE_WORK_QUEUE_FULL: 20011,	// 任务队列满
	FPNN_EC_CORE_INVALID_CONNECTION: 20012,	// 无效的链接
	FPNN_EC_CORE_FORBIDDEN: 20013,			// 禁止操作
	FPNN_EC_CORE_SERVER_STOPPING: 20014		// 服务器即将停止
};

const FPNN_VERSION = Buffer.from([0x0, 0x1]);

const FP_FLAG = Buffer.from([
	0x40, //FP_FLAG_JSON
	0x80  //FP_FLAG_MSGPACK 
]);

const FP_MESSAGE_TYPE = Buffer.from([
	0x0, //FP_MT_ONEWAY
	0x1, //FP_MT_TWOWAY
	0x2  //FP_MT_ANSWER
]);

const TCP_MAGIC = Buffer.from('FPNN');
const HTTP_MAGIC = Buffer.from('POST');

const CRYPTO_CURVES = [
	'secp256k1',
	'secp224r1'
];

const CRYPTO_ALGORITHM = [
	'aes-128-cfb',
	'aes-256-cfb'
];

class FPConfig {

	static get ERROR_CODE() {

		return ERROR_CODE;
	}

	static get FP_FLAG() {

		return FP_FLAG;
	}

	static get FP_MESSAGE_TYPE() {

		return FP_MESSAGE_TYPE;
	}

	static get TCP_MAGIC() {

		return TCP_MAGIC;
	}

	static get HTTP_MAGIC() {

		return HTTP_MAGIC;
	}

	static get FPNN_VERSION() {

		return FPNN_VERSION;
	}

	static get READ_BUFFER_LEN() {

		return 1024;
	}

	static get CHECK_CBS_INTERVAL() {
		
		return 1000;
	}

	static get SEND_TIMEOUT() {

		return 20 * 1000;
	}
	
	static get CRYPTO_CURVES() {

		return CRYPTO_CURVES;
	}

	static get CRYPTO_ALGORITHM() {

		return CRYPTO_ALGORITHM;
	}
}

module.exports = FPConfig;