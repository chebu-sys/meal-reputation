// src/utils/db.js

// mysql2/promiseモジュールをインポート
// `promise`を使うことで、非同期処理をasync/await構文で書くことができ、コードが読みやすくなります
const mysql = require('mysql2/promise');

// データベース接続プールを作成
// アプリケーション起動時に複数の接続を確立しておき、必要に応じて使い回すことで、
// パフォーマンスを向上させ、接続と切断のオーバーヘッドを削減します
const pool = mysql.createPool({
    host: 'mysql',       // データベースサーバーのホスト名
    user: 'root',        // データベースに接続するためのユーザー名
    password: process.env.DB_PASSWORD, // ユーザーのパスワード
    database: 'MealReputation' // 接続するデータベース名
});


// 接続プールをモジュールとしてエクスポート
// これにより、他のファイル（例: routes/auth.js, routes/companies.jsなど）から
// `require`して、データベース操作を行うことができます
module.exports = pool;