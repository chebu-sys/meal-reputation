// src/routes/auth.js

const express = require('express');
const router = express.Router(); 
const bcrypt = require('bcryptjs'); 
const pool = require('../utils/db'); 

/**
 * 認証ミドルウェア
 */
const isAuthenticated = (req, res, next) => {
    if (req.session.company) {
        next();
    } else {
        res.redirect('/Cologin');
    }
};

// ログイン画面表示用のGETリクエストを処理
router.get('/Cologin', (req, res) => {
    // セッションから通常の成功メッセージを取得し、削除する (新規登録、パスワード変更用)
    const successMessage = req.session.successMessage;
    delete req.session.successMessage;

    // ★修正: アカウント削除成功メッセージを取得し、削除する
    const deleteSuccessMessage = req.session.deleteSuccessMessage;
    delete req.session.deleteSuccessMessage;

    if (req.session.company) {
        res.redirect('/dashboard');
    } else {
        // ログインセッションがなければ、company_login.ejsをレンダリング
        res.render('company_login', { 
            message: null, 
            // どちらかのメッセージがあれば表示
            successMessage: successMessage || deleteSuccessMessage, 
            company: null // ★修正: company変数を明示的にnullで渡す (クラッシュ回避)
        });
    }
});

// ログインフォームのPOSTリクエストを処理
router.post('/Cologin', async (req, res) => {
    const { login_id, password } = req.body;

    try {
        const [rows] = await pool.query('SELECT * FROM companies WHERE login_id = ?', [login_id]);
        
        if (rows.length === 0) {
            return res.render('company_login', { 
                message: 'ログインIDまたはパスワードが正しくありません。', 
                successMessage: null,
                company: null
            });
        }

        const company = rows[0];
        const isMatch = await bcrypt.compare(password, company.password);
        
        if (!isMatch) {
            return res.render('company_login', { 
                message: 'ログインIDまたはパスワードが正しくありません。', 
                successMessage: null,
                company: null
            });
        }

        req.session.company = { 
            company_id: company.company_id, 
            login_id: company.login_id 
        }; 

        console.log(`${new Date().toLocaleString()} : ${company.login_id} (Login Success)`);
        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
        res.status(500).render('company_login', { 
            message: 'サーバーエラーが発生しました。', 
            successMessage: null,
            company: null
        });
    }
});

// 新規登録画面表示用のGETリクエストを処理
router.get('/register', (req, res) => {
    res.render('company_register', { message: null });
});

// 新規登録フォームのPOSTリクエストを処理
router.post('/register', async (req, res) => {
    const { login_id, password } = req.body;
    
    // バリデーション省略

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query('INSERT INTO companies (login_id, password) VALUES (?, ?)', [login_id, hashedPassword]);
        
        req.session.successMessage = '新規登録が完了しました。ログインしてください。';
        res.redirect('/Cologin');
    } catch (err) {
        console.error(err);
        if (err.code === 'ER_DUP_ENTRY') {
            res.render('company_register', { message: '入力されたIDはすでに使用されています。' });
        } else {
            res.status(500).render('company_register', { message: 'サーバーエラーが発生しました。' });
        }
    }
});

// パスワード変更画面表示 (GET /password-change)
router.get('/password-change', isAuthenticated, (req, res) => {
    res.render('password_change', { message: null, oldData: {} });
});


// パスワード変更処理 (POST /password-change)
router.post('/password-change', isAuthenticated, async (req, res) => {
    // ... (パスワード変更ロジック省略) ...
    const { old_password, new_password, confirm_password } = req.body;
    const companyId = req.session.company.company_id;
    
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]).{8,20}$/;
    if (!passwordRegex.test(new_password)) {
        return res.render('password_change', { 
            message: '新しいパスワードは8文字以上20文字以内の半角英数字と特殊文字を含めてください。',
            oldData: req.body
        });
    }

    if (new_password !== confirm_password) {
        return res.render('password_change', { 
            message: '新しいパスワードと確認用パスワードが一致しません。',
            oldData: req.body
        });
    }

    try {
        const [companyRows] = await pool.query('SELECT password FROM companies WHERE company_id = ?', [companyId]);
        
        if (companyRows.length === 0) {
             return res.redirect('/Clogout');
        }
        
        const hashedPassword = companyRows[0].password;

        const isMatch = await bcrypt.compare(old_password, hashedPassword);
        if (!isMatch) {
            return res.render('password_change', { 
                message: '現在のパスワードが正しくありません。',
                oldData: req.body
            });
        }

        const newHashedPassword = await bcrypt.hash(new_password, 10);
        await pool.query('UPDATE companies SET password = ? WHERE company_id = ?', [newHashedPassword, companyId]);

        req.session.successMessage = 'パスワードの変更を完了しました。';
        res.redirect('/dashboard');

    } catch (err) {
        console.error(err);
        return res.render('password_change', { 
            message: 'パスワードの変更中にエラーが発生しました。', 
            oldData: req.body 
        });
    }
});


// ログアウト処理
router.get('/Clogout', (req, res) => {
    const user = req.session.company ? req.session.company.login_id : 'NO_SESSION';
    req.session.destroy(err => {
        if (err) {
            console.error(err);
            return res.status(500).send('ログアウトに失敗しました。');
        }
        console.log(`${new Date().toLocaleString()} : ${user} (Logout)`);
        res.redirect('/Cologin');
    });
});

// ルーターをエクスポート
module.exports = { 
    authRouter: router, 
    isAuthenticated 
};