// /src/server.js の内容をこれで完全に置き換えてください

//＝＝＝＝＝＝＝＝＝＝＝＝＝＝おまじない的なやつ＝＝＝＝＝＝＝＝＝＝＝＝＝＝//
const express = require("express");
const session = require("express-session");
// const bodyParser = require('body-parser'); // ← 不要

const app = express();
const PORT = 3000;

// ミドルウェア設定
// ★★★ 修正: JSONとフォームデータの両方をExpress標準で解析 ★★★
app.use(express.json()); // いいねAPIのJSONデータ解析に必須
app.use(express.urlencoded({ extended: true })); // 口コミ投稿フォームのデータ解析に必須

// CSSなどの静的ファイル公開
app.use(express.static("public")); 

// /images URLでアクセスされたら、Dockerコンテナ内の/imagesディレクトリを公開
app.use('/images', express.static('/images')); 

app.set("view engine", "ejs");


// セッション設定
app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  name: 'connect.sid.3000'
}));

// タイムスタンプログ
app.use((req,res,next)=>{
  console.log(new Date().toLocaleString() + ' : ' + req.url + ' : ' + (req.session.user || 'guest'));
  next();
});

// ログイン状態を全ページで使えるようにする設定
app.use((req, res, next) => {
  res.locals.isLoggedIn = !!req.session.user;
  next();
});

// 各機能をルーターとして読み込む
const authRouter = require('./routes/auth.js');
const userinfoRouter = require('./routes/userinfo.js');
const storeRouter = require('./routes/store.js');

app.use('/', authRouter);
app.use('/login/userinfo', userinfoRouter);
app.use('/storeInfo', storeRouter);


// サーバー起動
app.listen(PORT,()=>console.log(`Express: ポート${PORT}で起動`));

// cd webtest
// node src/server.js