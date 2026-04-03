const mysql = require('mysql2/promise');

//------------------MYSQLの各値セット------------------//
const pool = mysql.createPool({
    connectionLimit: 10, // プールに保持するコネクションの最大数
    host:'mysql', 
    user:'root',
    password:'password',
    database: 'MealReputation' // データベース名
});
//----------------------------------------------------//

module.exports = pool;
