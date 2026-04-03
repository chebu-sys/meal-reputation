// src/routes/companies.js

const express = require('express');
const router = express.Router();
const pool = require('../utils/db');

// auth.jsからisAuthenticatedミドルウェアをインポート
const { isAuthenticated } = require('./auth');

// ★★★ 1. 企業ダッシュボード表示 (GET /dashboard) ★★★
router.get('/dashboard', isAuthenticated, async (req, res) => {
    const companyId = req.session.company.company_id;
    
    // パスワード変更/企業情報更新成功メッセージをセッションから取得し、削除
    const successMessage = req.session.successMessage;
    delete req.session.successMessage; 

    try {
        // 企業情報を取得 (ログインIDとパスワードは除く)
        const [companyRows] = await pool.query(
            'SELECT company_id, name, address, contact FROM companies WHERE company_id = ?',
            [companyId]
        );
        const company = companyRows.length > 0 ? companyRows[0] : {};

        // 企業に関連する店舗一覧を取得
        const [stores] = await pool.query(
            'SELECT store_id, name FROM stores WHERE company_id = ? ORDER BY store_id ASC',
            [companyId]
        );
        
        // company_dashboard.ejsをレンダリング
        res.render('company_dashboard', { 
            company: company, 
            stores: stores,
            successMessage: successMessage // EJSにメッセージを渡す
        });

    } catch (err) {
        console.error('ダッシュボード表示エラー:', err);
        res.status(500).render('company_dashboard', { 
            company: { name: '取得失敗' },
            stores: [],
            successMessage: 'データ取得中にサーバーエラーが発生しました。' 
        });
    }
});

// ★★★ 2. 企業情報編集画面表示 (GET /company/profile/edit) ★★★
router.get('/company/profile/edit', isAuthenticated, async (req, res) => {
    const companyId = req.session.company.company_id;
    
    try {
        const [companyRows] = await pool.query(
            'SELECT name, address, contact FROM companies WHERE company_id = ?',
            [companyId]
        );
        const company = companyRows.length > 0 ? companyRows[0] : {};

        res.render('company_profile_edit', { 
            company: company, 
            message: null 
        });
        
    } catch (err) {
        console.error('企業情報編集画面表示エラー:', err);
        res.status(500).render('company_profile_edit', { 
            company: {}, 
            message: 'データ取得中にサーバーエラーが発生しました。' 
        });
    }
});

// ★★★ 3. 企業情報編集処理 (POST /company/profile/edit) ★★★
router.post('/company/profile/edit', isAuthenticated, async (req, res) => {
    const { name, address, contact } = req.body;
    const companyId = req.session.company.company_id;

    try {
        await pool.query(
            'UPDATE companies SET name = ?, address = ?, contact = ? WHERE company_id = ?',
            [name, address, contact, companyId]
        );

        req.session.successMessage = '企業情報の更新を完了しました。';
        res.redirect('/dashboard');

    } catch (err) {
        console.error('企業情報更新エラー:', err);
        res.render('company_profile_edit', { 
            company: req.body, 
            message: '情報の更新中にサーバーエラーが発生しました。' 
        });
    }
});

// ★★★ 4. アカウント削除確認画面 (GET /delete-account-confirm) ★★★
router.get('/delete-account-confirm', isAuthenticated, (req, res) => {
    res.render('delete_account_confirm');
});


// ★★★ 修正: GET /delete-account にアクセスされた場合、確認画面へリダイレクトする ★★★
router.get('/delete-account', isAuthenticated, (req, res) => {
    // Cannot GET /delete-account エラーを回避し、確認画面へ誘導する
    res.redirect('/delete-account-confirm');
});
// ★★★ 修正箇所終わり ★★★


// ★★★ 5. アカウント削除処理 (POST /delete-account) ★★★
router.post('/delete-account', isAuthenticated, async (req, res) => {
    const companyId = req.session.company.company_id;
    const loginId = req.session.company.login_id;

    try {
        // 企業に関連する全ての店舗を削除
        await pool.query('DELETE FROM stores WHERE company_id = ?', [companyId]);
        
        // 企業アカウント自体を削除
        await pool.query('DELETE FROM companies WHERE company_id = ?', [companyId]);
        
        // ★修正ポイント: destroy()を使うと直前のメッセージも消えるため、
        // ログイン状態(company)だけを削除し、ログアウト状態にします。
        delete req.session.company;
        
        // メッセージをセットして、新しいログイン画面(/Cologin)へ飛ばす
        req.session.deleteSuccessMessage = 'アカウントと関連する全ての店舗情報を削除しました。';
        
        console.log(`${new Date().toLocaleString()} : ${loginId} (Account Deleted)`);
        res.redirect('/Cologin');

    } catch (err) {
        console.error('アカウント削除エラー:', err);
        // エラーが発生した場合、ダッシュボードに戻りメッセージを表示
        req.session.successMessage = 'アカウントの削除中にエラーが発生しました。';
        res.redirect('/dashboard');
    }
});


// ルーターをエクスポート
module.exports = router;