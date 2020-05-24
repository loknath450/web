'user strict';
var mysql = require('mysql');
console.log('db.js executed');

var dbConfig = {
    host: process.env.RDS_HOSTNAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DBNAME,
}

var connection;

function handleDisconnect() {
    connection = mysql.createConnection(dbConfig);
    connection.connect(function (err) {
        if (err) {
            console.log('error when connecting to db:', err);
            setTimeout(handleDisconnect, 2000);
        }
    });

    connection.on('error', function (err) {
        console.log('Custom Message: Db error \n', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
            handleDisconnect();
        } else {
            throw err;
        }
    });

    setInterval(function () {
        console.log('Querying in db.js');
        connection.query('SELECT 1');
    }, 60000);
}

handleDisconnect();

module.exports = connection;