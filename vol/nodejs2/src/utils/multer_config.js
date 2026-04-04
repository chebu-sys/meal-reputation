// src/utils/multer_config.js

// 必要なNode.jsモジュールをインポート
const multer = require('multer'); 
const path = require('path');   
const fs = require('fs');       

// 1. Multerのストレージ設定（保存先とファイル名の決定）
const storage = multer.diskStorage({
    /**
     * ファイルの保存先（`destination`）を決定する関数
     */
    destination: (req, file, cb) => {
        const uploadPath = '/app_images'; 
 
        // ディレクトリの存在チェックと作成（エラー対策）
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

// 2. ★★★ ファイル形式のフィルター（SOC必須要件）★★★
const fileFilter = (req, file, cb) => {
    // 許可するファイルのMIMEタイプを指定（偽装ファイル対策としてMIMEタイプで判定）
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (allowedMimeTypes.includes(file.mimetype)) {
        // 画像なら許可して次の処理へ
        cb(null, true);
    } else {
        // 画像以外（PDFやEXEなど）なら拒否してエラーを投げる（ディスクには保存されない）
        cb(new Error('画像ファイル（JPEG, PNG, GIF, WEBP）のみアップロード可能です。'), false);
    }
};

// 3. ★★★ 最終的なMulterインスタンスの作成（全防御を統合）★★★
const upload = multer({ 
    storage: storage,
    limits: { 
        // 容量制限：Nginxの制限に合わせて最大20MBまで許可（DoS攻撃対策）
        fileSize: 20 * 1024 * 1024 
    },
    fileFilter: fileFilter // ここで上のフィルターを適用
});

// Multerインスタンスをモジュールとしてエクスポート
module.exports = { upload };