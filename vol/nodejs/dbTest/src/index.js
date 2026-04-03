const express = require('express');
const mysql = require('mysql2/promise');

const app = express();
const port = 3000;

// MySQLのコネクションプールを作成
const pool = mysql.createPool({
  host: 'mysql',
  user: 'root',       // ← MySQLのユーザー名に置き換えてください
  password: 'password',   // ← パスワードに置き換えてください
  database: 'fruits_db',       // 使用するデータベース名
});

// ルートハンドラ：すべてのフルーツを取得
app.get('/',async(req,res)=>{
    const [rows, fields] = await pool.query('SELECT * FROM fruits');
    res.send(rows);
});

app.listen(port, () => {
  console.log(`サーバー起動 http://localhost:${port}`);
});
