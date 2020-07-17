const mysql = require('mysql');
const mysqlConnection = mysql.createConnection({
    host:'localhost',
    port:'3306',         
    user:'root',
    password:'',
    database:'maxonic_tickets_service'
}) 

mysqlConnection.connect(function(error){
    if(!!error){
        console.log('error',error);
    }else{
        console.log('db is connected')
    }
})

module.exports = mysqlConnection;