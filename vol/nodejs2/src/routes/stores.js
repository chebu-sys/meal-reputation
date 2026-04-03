// vol/nodejs2/routes/stores.js

// 必要なNode.jsモジュールをインポート
const express = require('express'); 
const router = express.Router(); 
const path = require('path'); 
const fs = require('fs'); 
const pool = require('../utils/db'); 
const { isAuthenticated } = require('./auth'); 
const { upload } = require('../utils/multer_config'); 
const sharp = require('sharp'); // sharpをインポート

// 画像の物理保存先（Docker Volumeのマウント先）
const IMAGE_MOUNT_ROOT = '/app_images'; 


// 1. 店舗新規登録画面の表示 (GET /stores/new)
router.get('/stores/new', isAuthenticated, (req, res) => {
    res.render('store_new');
});

// 2. 店舗新規登録処理 (POST /stores/new)
router.post('/stores/new', isAuthenticated, upload.single('image'), async (req, res) => {
    const { name, address, phone_number, description, genre } = req.body; 
    const companyId = req.session.company.company_id; 
    const image_url = req.file ? `/images/${req.file.filename}` : null;
    let image_width = null; 
    let image_height = null; 

    try {
        // 画像の幅と高さを取得
        if (req.file) {
            const filePath = path.join(IMAGE_MOUNT_ROOT, req.file.filename);
            const metadata = await sharp(filePath).metadata();
            image_width = metadata.width || null;
            image_height = metadata.height || null;
        }

        // データベースに新しい店舗情報（幅、高さを含む）を登録
        await pool.query(
            'INSERT INTO stores (company_id, name, address, phone_number, description, genre, image_url, image_width, image_height) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
            [companyId, name, address, phone_number, description, genre, image_url, image_width, image_height] 
        );

        res.redirect('/dashboard');
    } catch (err) {
        console.error("Error creating new store:", err);
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).send('店舗の新規登録に失敗しました。');
    }
});


// 3. 店舗詳細画面の表示 (GET /stores/:storeId)
router.get('/stores/:storeId', isAuthenticated, async (req, res) => {
    const storeId = req.params.storeId;
    const companyId = req.session.company.company_id; 

    try {
        // 1. 店舗情報を取得
        // ★ image_width, image_height も取得 (EJSの比率計算に使用)
        const [storeRows] = await pool.query(
            'SELECT store_id, name, address, phone_number, description, image_url, image_width, image_height FROM stores WHERE store_id = ? AND company_id = ?', 
            [storeId, companyId]
        );
        if (storeRows.length === 0) {
            return res.status(404).send('店舗が見つからないか、アクセス権がありません。');
        }
        const store = storeRows[0];
        
        // 2. メニュー情報を取得
        const [menuRows] = await pool.query(
            'SELECT menu_id, menu_name, price FROM menus WHERE store_id = ?', 
            [storeId]
        );

        // 3. レンダリング
        res.render('store_management_detail', { store, menus: menuRows }); 
        
    } catch (err) {
        console.error("Error fetching store detail for management:", err);
        res.status(500).send('店舗情報の取得中にエラーが発生しました。');
    }
});


// 4. 店舗編集画面の表示 (GET /stores/:storeId/edit)
router.get('/stores/:storeId/edit', isAuthenticated, async (req, res) => {
    const storeId = req.params.storeId;
    const companyId = req.session.company.company_id;

    try {
        // ★ image_width, image_height も取得
        const [storeRows] = await pool.query('SELECT store_id, name, address, phone_number, description, genre, image_url, image_width, image_height FROM stores WHERE store_id = ? AND company_id = ?', [storeId, companyId]);
        if (storeRows.length === 0) {
            return res.status(404).send('店舗が見つからないか、アクセス権がありません。');
        }
        res.render('store_edit', { store: storeRows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).send('エラーが発生しました。');
    }
});


// 5. 店舗情報更新処理 (POST /stores/:storeId/edit)
router.post('/stores/:storeId/edit', isAuthenticated, upload.single('image'), async (req, res) => {
    const storeId = req.params.storeId;
    const companyId = req.session.company.company_id;
    const { name, address, phone_number, description, genre } = req.body; 
    
    let query = 'UPDATE stores SET name = ?, address = ?, phone_number = ?, description = ?, genre = ?';
    const params = [name, address, phone_number, description, genre];
    
    let current_image_url = null;
    let current_image_width = null;
    let current_image_height = null;
    
    try {
        // 既存の画像情報（URL、幅、高さ）を取得
        const [storeRows] = await pool.query('SELECT image_url, image_width, image_height FROM stores WHERE store_id = ? AND company_id = ?', [storeId, companyId]);
        if (storeRows.length === 0) {
             return res.status(404).send('店舗が見つからないか、アクセス権がありません。');
        }
        current_image_url = storeRows[0].image_url;
        current_image_width = storeRows[0].image_width;
        current_image_height = storeRows[0].image_height;


        // 1. ファイルがアップロードされた場合（画像置換時）
        if (req.file) {
            const filePath = path.join(IMAGE_MOUNT_ROOT, req.file.filename);
            const metadata = await sharp(filePath).metadata();
            
            // ★★★ 修正箇所：新しいメタデータを取得 ★★★
            const new_image_width = metadata.width || null;
            const new_image_height = metadata.height || null;
            
            const updated_image_url = `/images/${req.file.filename}`;
            
            // image_url, image_width, image_height を新しい値で更新
            query += ', image_url = ?, image_width = ?, image_height = ?'; 
            params.push(updated_image_url, new_image_width, new_image_height); 
            
            // 古い画像を削除
            if (current_image_url) {
                const oldFilename = path.basename(current_image_url);
                const oldImagePath = path.join(IMAGE_MOUNT_ROOT, oldFilename);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, err => { 
                        if (err) console.error(`Failed to delete old image: ${oldImagePath}`, err); 
                    });
                }
            }

        // 2. 画像削除がチェックされている場合
        } else if (req.body.delete_image === 'on') {
            
            // ★★★ 修正箇所：image_url, image_width, image_height を NULL に設定 ★★★
            query += ', image_url = NULL, image_width = NULL, image_height = NULL'; 
            
            // 古い画像を削除（物理削除）
             if (current_image_url) {
                const oldFilename = path.basename(current_image_url);
                const oldImagePath = path.join(IMAGE_MOUNT_ROOT, oldFilename);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlink(oldImagePath, err => { 
                        if (err) console.error(`Failed to delete old image: ${oldImagePath}`, err); 
                    });
                }
            }
        
        // 3. 画像の変更も削除チェックもない場合 (画像維持)
        } else {
            // 既存の値を維持
            query += ', image_url = ?, image_width = ?, image_height = ?'; 
            params.push(current_image_url, current_image_width, current_image_height);
        }

        query += ' WHERE store_id = ? AND company_id = ?';
        params.push(storeId, companyId);

        await pool.query(query, params);

        res.redirect(`/stores/${storeId}`);
    } catch (err) {
        console.error("Error updating store:", err);
        // エラー発生時、アップロードされたファイルを削除
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).send('店舗情報の更新に失敗しました。');
    }
});


// 6. 店舗削除処理 (POST /stores/:storeId/delete)
router.post('/stores/:storeId/delete', isAuthenticated, async (req, res) => {
    const storeId = req.params.storeId;
    const companyId = req.session.company.company_id; 
    
    try {
        // 1. 削除対象の店舗情報を取得し、画像URLを確保 (DB削除前に必要)
        const [storeRows] = await pool.query('SELECT image_url FROM stores WHERE store_id = ? AND company_id = ?', [storeId, companyId]);
        
        if (storeRows.length === 0) {
            return res.status(404).send('店舗が見つからないか、アクセス権がありません。');
        }
        const imageUrl = storeRows[0].image_url;
        
        // 2. データベースから店舗を削除
        await pool.query('DELETE FROM stores WHERE store_id = ? AND company_id = ?', [storeId, companyId]);

        // 3. 関連する画像ファイルがあれば削除（物理削除）
        if (imageUrl) {
            const filename = path.basename(imageUrl);
            const imagePath = path.join(IMAGE_MOUNT_ROOT, filename); 
            
            if (fs.existsSync(imagePath)) {
                fs.unlink(imagePath, err => { 
                    if (err) console.error(`Failed to delete old image: ${imagePath}`, err); 
                });
            }
        }

        res.redirect('/dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('店舗の削除に失敗しました。');
    }
});


module.exports = router;