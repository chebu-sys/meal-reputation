const express = require('express');
const mysql = require('mysql2/promise');
const PORT = 3000;

const app = express();

const pool = mysql.createPool({
    host:'mysql', //mysqlのホスト名やIPアドレスを記述
    user:'root', //mysqlのユーザー名を記述
    password:'password', //mysqlのユーザー名に対応するパスワードを記述
    database:'fruits_db', //データベース名を記述
});

app.get('/',async(req,res)=>{
    const [rows, fields] = await pool.query('SELECT name, price, stock FROM fruits');
    res.send(rows);
});

app.listen(PORT, () => {
    console.log(`サーバー起動中…（ポート番号:${PORT}）`);
});