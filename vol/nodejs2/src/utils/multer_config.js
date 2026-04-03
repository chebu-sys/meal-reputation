// src/utils/multer_config.js

// 必要なNode.jsモジュールをインポート
const multer = require('multer'); 
const path = require('path');   
const fs = require('fs');       // ★★★ fsを再利用 ★★★

// Multerのストレージ設定を定義
const storage = multer.diskStorage({
    /**
     * ファイルの保存先（`destination`）を決定する関数
     */
     destination: (req, file, cb) => {
       // ★★★ 修正箇所１：新しいマウントパスに修正（C:/docker_data/images の実体）★★★
       const uploadPath = '/app_images'; 
 
        // ★★★ 修正箇所２：ディレクトリの存在チェックと作成を追加（エラー対策）★★★
       if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
       }
        
        // 保存先ディレクトリをMulterに通知
       cb(null, uploadPath);
     },

     /**
     * アップロードされたファイルのファイル名（`filename`）を決定する関数
     */
      filename: (req, file, cb) => {
       // タイムスタンプとランダムな数字を組み合わせて一意なファイル名を作成
         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

       // 元のファイル名から拡張子を取得
         const extname = path.extname(file.originalname);

       // 新しいファイル名を生成
         cb(null, file.fieldname + '-' + uniqueSuffix + extname);
    }
});

// 上記で定義したストレージ設定を使用してMulterインスタンスを作成
const upload = multer({ storage: storage });

// Multerインスタンスをモジュールとしてエクスポート
module.exports = { upload };