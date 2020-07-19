const mysql = require('mysql');

var db = mysql.createConnection({
  host : 'localhost',
  user : 'root',
  password : '######',
  database : 'angelhack'
});

db.connect();
module.exports = db;
