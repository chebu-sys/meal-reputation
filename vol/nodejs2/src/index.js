// node src/index.js

// 必要なモジュールをインポート
const express = require('express'); 
const session = require('express-session'); 
const bodyParser = require('body-parser'); 
const path = require('path'); // path モジュールをインポート

// 各機能のルート定義ファイル（ルーター）をインポート
const { authRouter, isAuthenticated } = require('./routes/auth'); 
const companyRouter = require('./routes/companies'); 
const storesRouter = require('./routes/stores'); 
const menusRouter = require('./routes/menus'); 

// Expressアプリケーションのインスタンスを作成
const app = express();
const port = 4000; 

// ミドルウェア設定
app.use(bodyParser.urlencoded({ extended: false }));

// 既存の設定: `public`ディレクトリ内の静的ファイル（CSSなど）を公開
// 【★★★ 修正箇所 ★★★】
// index.jsは 'src' 内、'public' はルート直下にあるため、'..' を追加して一つ上の階層に戻る
app.use(express.static(path.join(__dirname, '..', 'public'))); 
// ↑ この修正により、静的ファイルの正しいパス /home/node/projects/public が指定されます。

// ★★★ 画像フォルダを /images URLで公開 ★★★
// C:/docker_data/images の実体であるコンテナ内の /app_images を、
// データベースのURL（/images/...）に合わせて公開する
app.use('/images', express.static('/app_images')); 

// `views`ディレクトリにEJSテンプレートファイルがあることを設定
app.set("views", "./views"); //
// ビューエンジンとしてEJSを使用することを設定
app.set("view engine", "ejs"); //

// セッション設定
app.use(session({
    secret: process.env.SESSION_SECRET, 
    resave: false, 
    saveUninitialized: false, 
    cookie: { secure: false } ,
    name: 'connect.sid.4000'
}));

// リクエストログミドルウェア
app.use((req, res, next) => {
    // ログインIDまたはセッション状態を取得
    const user = req.session.company ? req.session.company.login_id : 'NO_SESSION';
    console.log(`${new Date().toLocaleString()} : ${req.method} ${req.url} : ${user}`);
    next();
});

// ルーティング
app.get('/', (req, res) => {
    // ルートアクセス時、ログインページにリダイレクト
    res.redirect('/Cologin');
});

// 認証・ログイン/ログアウト系ルートの適用
app.use('/', authRouter); //

// 企業/店舗/メニュー関連ルートの適用（ログイン必須）
// これらのルートにアクセスする前にisAuthenticatedミドルウェアを適用したい場合は、
// ここでapp.use('/dashboard', isAuthenticated, companyRouter); のように設定する
app.use('/', companyRouter); //
app.use('/', storesRouter); //
app.use('/', menusRouter); //

// サーバーを起動
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    console.log(`Access at: http://localhost:${port}`);
});

 // node src/index.js