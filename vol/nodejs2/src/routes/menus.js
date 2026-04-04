// vol/nodejs2/routes/menus.js (最終確認済・堅牢化版)

const express = require('express'); 
const router = express.Router(); 
const pool = require('../utils/db'); 
const { isAuthenticated } = require('./auth'); 

// --- 共通バリデーション関数 ---
const getValidationError = (name, price) => {
    // 1. メニュー名のチェック
    if (!name || name.trim().length === 0) {
        return 'メニュー名を入力してください。';
    }
    if (name.length > 100) {
        return 'メニュー名は100文字以内で入力してください。';
    }
    
    // 2. 価格の存在チェック
    if (price === undefined || price === null || price === '') {
        return '価格は必須項目です。';
    }

    // 3. 価格の数値・正負・整数チェック
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice < 0 || !Number.isInteger(numPrice)) {
        return '価格は0以上の整数で入力してください。';
    }
    
    return null;
};

// 1. 新規登録画面 (GET)
router.get('/stores/:storeId/menus/new', isAuthenticated, async (req, res) => {
    const { storeId } = req.params;
    const companyId = req.session.company.company_id;
    
    try {
        const [storeRows] = await pool.query(
            'SELECT * FROM stores WHERE store_id = ? AND company_id = ?', 
            [storeId, companyId]
        );
        
        if (storeRows.length === 0) {
            return res.status(404).send('店舗が見つからないか、アクセス権がありません。');
        }
        
        res.render('menu_new', { store: storeRows[0], errorMessage: null, oldData: {} }); 
    } catch (err) { 
        console.error("[ERROR] GET /menus/new:", err); 
        res.status(500).send('サーバーエラーが発生しました。'); 
    }
});

// 2. 新規登録処理 (POST)
router.post('/stores/:storeId/menus/new', isAuthenticated, async (req, res) => {
    const { storeId } = req.params;
    const companyId = req.session.company.company_id;
    let { menu_name, price } = req.body;
    
    // サニタイズ（前後の空白除去）
    menu_name = menu_name ? menu_name.trim() : '';

    const error = getValidationError(menu_name, price);
    if (error) {
        const [storeRows] = await pool.query(
            'SELECT * FROM stores WHERE store_id = ? AND company_id = ?', 
            [storeId, companyId]
        );
        // 安全装置：再表示時に店舗が消えていた場合のクラッシュ防止
        if (storeRows.length === 0) return res.status(404).send('店舗が見つかりません。');
        
        return res.render('menu_new', { 
            store: storeRows[0], 
            errorMessage: error, 
            oldData: { menu_name, price } 
        });
    }

    try {
        // 認可チェック（本当に自分の会社の店舗か）
        const [stores] = await pool.query(
            'SELECT store_id FROM stores WHERE store_id = ? AND company_id = ?', 
            [storeId, companyId]
        );
        if (stores.length === 0) return res.status(403).send('不正なアクセスです。');

        await pool.query(
            'INSERT INTO menus (store_id, menu_name, price) VALUES (?, ?, ?)', 
            [storeId, menu_name, parseInt(price, 10)]
        );
        res.redirect(`/stores/${storeId}`);
    } catch (err) { 
        console.error("[ERROR] POST /menus/new:", err); 
        res.status(500).send('メニューの登録に失敗しました。'); 
    }
});

// 3. 編集画面 (GET)
router.get('/stores/:storeId/menus/:menuId/edit', isAuthenticated, async (req, res) => {
    const { storeId, menuId } = req.params;
    const companyId = req.session.company.company_id;
    
    try {
        const [storeRows] = await pool.query(
            'SELECT * FROM stores WHERE store_id = ? AND company_id = ?', 
            [storeId, companyId]
        );
        const [menuRows] = await pool.query(
            'SELECT * FROM menus WHERE menu_id = ? AND store_id = ?', 
            [menuId, storeId]
        );
        
        if (storeRows.length === 0 || menuRows.length === 0) {
            return res.status(404).send('データが見つからないか、アクセス権がありません。');
        }
        
        res.render('menu_edit', { store: storeRows[0], menu: menuRows[0], errorMessage: null, oldData: {} }); 
    } catch (err) { 
        console.error("[ERROR] GET /menus/edit:", err);
        res.status(500).send('データの取得に失敗しました。'); 
    }
});

// 4. 編集処理 (POST)
router.post('/stores/:storeId/menus/:menuId/edit', isAuthenticated, async (req, res) => {
    const { storeId, menuId } = req.params;
    const companyId = req.session.company.company_id;
    let { menu_name, price } = req.body;
    
    menu_name = menu_name ? menu_name.trim() : '';

    const error = getValidationError(menu_name, price);
    if (error) {
        const [storeRows] = await pool.query(
            'SELECT * FROM stores WHERE store_id = ? AND company_id = ?', 
            [storeId, companyId]
        );
        if (storeRows.length === 0) return res.status(404).send('店舗が見つかりません。');
        
        return res.render('menu_edit', { 
            store: storeRows[0], 
            menu: { menu_id: menuId, menu_name, price }, 
            errorMessage: error, 
            oldData: req.body 
        });
    }

    try {
        // JOINを使って、自社店舗のメニューのみ更新できるように制限（IDOR対策）
        const [result] = await pool.query(
            'UPDATE menus m JOIN stores s ON m.store_id = s.store_id SET m.menu_name=?, m.price=? WHERE m.menu_id=? AND m.store_id=? AND s.company_id=?',
            [menu_name, parseInt(price, 10), menuId, storeId, companyId]
        );
        
        if (result.affectedRows === 0) return res.status(403).send('更新権限がありません。');
        res.redirect(`/stores/${storeId}`);
    } catch (err) { 
        console.error("[ERROR] POST /menus/edit:", err); 
        res.status(500).send('メニューの更新に失敗しました。'); 
    }
});

// 5. 削除処理 (POST)
router.post('/stores/:storeId/menus/:menuId/delete', isAuthenticated, async (req, res) => {
    const { storeId, menuId } = req.params;
    const companyId = req.session.company.company_id;
    
    try {
        // JOINを使って、自社店舗のメニューのみ削除できるように制限（IDOR対策）
        const [result] = await pool.query(
            'DELETE m FROM menus m JOIN stores s ON m.store_id = s.store_id WHERE m.menu_id=? AND m.store_id=? AND s.company_id=?',
            [menuId, storeId, companyId]
        );
        
        if (result.affectedRows === 0) return res.status(403).send('削除権限がありません。');
        res.redirect(`/stores/${storeId}`);
    } catch (err) { 
        console.error("[ERROR] POST /menus/delete:", err); 
        res.status(500).send('メニューの削除に失敗しました。'); 
    }
});

module.exports = router;