const mysql = require('mysql');
const co_mysql = require('co-mysql');
const config = require('../config');

let conn = mysql.createPool({
    host : config.DB_HOST,
    user : config.DB_USER,
    password : config.DB_PASSWORD,
    database : config.DB_TABLE
});

module.exports = co_mysql(conn);