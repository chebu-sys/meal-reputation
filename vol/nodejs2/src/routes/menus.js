// vol/nodejs2/routes/menus.js (完全版)

const express = require('express'); 
const router = express.Router(); 
const pool = require('../utils/db'); 
const { isAuthenticated } = require('./auth'); 

// 価格のバリデーション関数
const validatePrice = (price) => {
    // 1. 値が存在するか
    if (price === undefined || price === null || price === '') {
        return '価格は必須項目です。';
    }
    
    // 2. 数値に変換できるか
    const numPrice = Number(price);
    if (isNaN(numPrice)) {
        return '価格は数値で入力してください。';
    }
    
    // 3. 0以上か
    if (numPrice < 0) {
        return '価格は0以上の値を入力してください。';
    }
    
    // 4. 整数か (小数点以下がないか)
    if (!Number.isInteger(numPrice)) {
        return '価格は整数で入力してください。';
    }

    return null; // エラーがなければnullを返す
};

// 1. メニュー新規登録画面の表示 (GET /stores/:storeId/menus/new)
router.get('/stores/:storeId/menus/new', isAuthenticated, async (req, res) => {
    const storeId = req.params.storeId;
    try {
        const [storeRows] = await pool.query('SELECT * FROM stores WHERE store_id = ? AND company_id = ?', [storeId, req.session.company.company_id]);
        
        if (storeRows.length === 0) {
            return res.status(404).send('店舗が見つからないか、アクセス権がありません。');
        }
        
        // EJSに渡すデータに、storeオブジェクトとエラーメッセージ(初期値null)を含める
        res.render('menu_new', { store: storeRows[0], errorMessage: null, oldData: {} }); 
    } catch (err) {
        console.error(err);
        res.status(500).send('エラーが発生しました。');
    }
});

// 2. メニュー新規登録処理 (POST /stores/:storeId/menus/new)
router.post('/stores/:storeId/menus/new', isAuthenticated, async (req, res) => {
    const storeId = req.params.storeId;
    const { menu_name, price } = req.body;
    
    // ★★★ サーバーサイド バリデーション ★★★
    const validationError = validatePrice(price);
    if (validationError) {
        // エラーがあった場合、店舗情報を再取得してエラーメッセージと共にレンダリング
        const [storeRows] = await pool.query('SELECT * FROM stores WHERE store_id = ? AND company_id = ?', [storeId, req.session.company.company_id]);
        if (storeRows.length === 0) {
            return res.status(404).send('店舗が見つからないか、アクセス権がありません。');
        }
        return res.render('menu_new', { 
            store: storeRows[0], 
            errorMessage: validationError, 
            oldData: req.body // 古い入力を再表示
        });
    }
    // ★★★ バリデーション終わり ★★★

    try {
        const [storeRows] = await pool.query('SELECT store_id FROM stores WHERE store_id = ? AND company_id = ?', [storeId, req.session.company.company_id]);
        if (storeRows.length === 0) {
            return res.status(403).send('不正なアクセスです。');
        }

        // DBに保存する際は、整数として確実に取り扱う
        const intPrice = parseInt(price, 10); 

        await pool.query(
            'INSERT INTO menus (store_id, menu_name, price) VALUES (?, ?, ?)',
            [storeId, menu_name, intPrice]
        );
        res.redirect(`/stores/${storeId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('メニューの新規登録に失敗しました。');
    }
});


// 3. メニュー編集画面の表示 (GET /stores/:storeId/menus/:menuId/edit)
router.get('/stores/:storeId/menus/:menuId/edit', isAuthenticated, async (req, res) => {
    const { storeId, menuId } = req.params;
    const companyId = req.session.company.company_id; 

    try {
        // 店舗情報を取得
        const [storeRows] = await pool.query(
            'SELECT store_id, name FROM stores WHERE store_id = ? AND company_id = ?', 
            [storeId, companyId]
        );
        if (storeRows.length === 0) {
            return res.status(404).send('店舗が見つからないか、アクセス権がありません。');
        }
        const store = storeRows[0]; 

        // メニュー情報を取得
        const [menuRows] = await pool.query(
            'SELECT menu_id, menu_name, price FROM menus WHERE menu_id = ? AND store_id = ?', 
            [menuId, storeId]
        );
        if (menuRows.length === 0) {
            return res.status(404).send('メニューが見つかりませんでした。');
        }
        const menu = menuRows[0];
        
        // menu_edit.ejsをレンダリング（エラーメッセージと古い入力(初期値null)を渡す）
        res.render('menu_edit', { store, menu, errorMessage: null, oldData: {} }); 
        
    } catch (err) {
        console.error("Error fetching menu detail for edit:", err);
        res.status(500).send('メニュー情報の取得中にエラーが発生しました。');
    }
});


// 4. メニュー編集処理 (POST /stores/:storeId/menus/:menuId/edit)
router.post('/stores/:storeId/menus/:menuId/edit', isAuthenticated, async (req, res) => {
    const { storeId, menuId } = req.params;
    const companyId = req.session.company.company_id;
    const { menu_name, price } = req.body;
    
    // ★★★ サーバーサイド バリデーション ★★★
    const validationError = validatePrice(price);
    if (validationError) {
        // エラーがあった場合、店舗情報と既存のメニュー情報を再取得してエラーメッセージと共にレンダリング
        
        const [storeRows] = await pool.query(
            'SELECT store_id, name FROM stores WHERE store_id = ? AND company_id = ?', 
            [storeId, companyId]
        );
        const [menuRows] = await pool.query(
            'SELECT menu_id, menu_name, price FROM menus WHERE menu_id = ? AND store_id = ?', 
            [menuId, storeId]
        );
        if (storeRows.length === 0 || menuRows.length === 0) {
             return res.status(404).send('データが見つからないか、アクセス権がありません。');
        }
        
        // エラー時の再表示用に、新しいメニュー名と不正な価格をmenuオブジェクトに上書き
        const menuWithErrors = { 
            ...menuRows[0], 
            menu_name: menu_name, 
            price: price // 不正な入力値をそのまま保持
        };

        return res.render('menu_edit', { 
            store: storeRows[0], 
            menu: menuWithErrors, 
            errorMessage: validationError, 
            oldData: req.body
        });
    }
    // ★★★ バリデーション終わり ★★★

    try {
        // DBに保存する際は、整数として確実に取り扱う
        const intPrice = parseInt(price, 10);

        await pool.query(
            'UPDATE menus SET menu_name=?, price=? WHERE menu_id=? AND store_id=?',
            [menu_name, intPrice, menuId, storeId]
        );
        res.redirect(`/stores/${storeId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('メニューの更新に失敗しました。');
    }
});

// 5. メニュー削除処理 (POST /stores/:storeId/menus/:menuId/delete)
router.post('/stores/:storeId/menus/:menuId/delete', isAuthenticated, async (req, res) => {
    const { storeId, menuId } = req.params;
    try {
        await pool.query('DELETE FROM menus WHERE menu_id=? AND store_id=?', [menuId, storeId]);
        res.redirect(`/stores/${storeId}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('メニューの削除に失敗しました。');
    }
});


module.exports = router;