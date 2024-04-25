var mysql = require('mysql');

var sql_connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'root',
    database:'ems_db'
})

module.exports = sql_connection;