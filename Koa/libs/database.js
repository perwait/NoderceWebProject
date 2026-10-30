const mysql = require('mysql');
const config = require('../config');
const makeDb = require('./transaction');

let pool = mysql.createPool({
    host : config.DB_HOST,
    port : parseInt(config.DB_PORT, 10) || 3306,
    user : config.DB_USER,
    password : config.DB_PASSWORD,
    database : config.DB_TABLE,
    connectionLimit : 10,   // 最大连接数
    waitForConnections : true,
    queueLimit : 50,        // 等待连接的请求超过这个数量就直接报错，避免请求无限堆积把服务器拖垮
    connectTimeout : 10000, // 建立连接超时 毫秒
    acquireTimeout : 10000  // 从连接池取连接超时 毫秒
});

// 提供 query(sql, params) 和 transaction(async tx => {...})
module.exports = makeDb(pool);
