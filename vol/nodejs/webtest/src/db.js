const mysql = require('mysql2/promise');

//------------------MYSQLの各値セット------------------//
const pool = mysql.createPool({
    connectionLimit: 10,
    host:'mysql', 
    user:'root',
    password: process.env.DB_PASSWORD, 
    database: 'MealReputation'
});
//----------------------------------------------------//

module.exports = pool;
