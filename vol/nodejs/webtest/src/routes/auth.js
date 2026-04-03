const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt'); // 追加
const saltRounds = 10; // 追加

// SQL
// ログインチェック用のSQLからパスワード比較を除外し、IDのみでユーザーを取得するように変更
const getUserSql = 'SELECT id, password FROM users WHERE id = ?';
const IdCHK = 'SELECT EXISTS(SELECT 1 FROM users WHERE id = ?) AS userid_check';
const userInsert = 'INSERT INTO users (id, password) VALUES (?,?)';
const LogonFail = "IDまたはパスワードが一致しません";

// 最終ログイン日時に関するクエリ
const updateLastLoginQuery = 'UPDATE userinfo SET last_login_at = NOW() WHERE user_id = ?';
const userinfoexists = 'SELECT EXISTS(SELECT * FROM userinfo WHERE user_id = ?) AS user_exists';
const userinfoInsertOnlyId = 'INSERT INTO userinfo (user_id) VALUES (?)';

// ルート
router.get("/", (req, res) => {
    if (!req.session.user) return res.render("Index");
    res.redirect('/login');
});

router.get("/login", (req, res) => {
    if (!req.session.user) return res.render("login", { LogInfo: "ログイン", isLoggedIn: 1 });
    res.render("login", { LogInfo: "ログアウト", isLoggedIn: 0 });
});

router.get("/logout", (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// POST /logout (StoreIndex.ejsからのログアウト処理)
router.post("/logout", (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// ログイン実行ルート
router.post("/home", async (req, res) => {
    try {
        // 1. まずユーザーIDでDBを検索し、ハッシュ化されたパスワードを取得する
        const [rows] = await pool.query(getUserSql, [req.body.username]);
        
        if (rows.length > 0) {
            const user = rows[0];
            // 2. 入力された生パスワードとDBのハッシュを比較（bcryptがソルトを自動処理）
            const isMatch = await bcrypt.compare(req.body.password, user.password);

            if (isMatch) {
                req.session.user = req.body.username;
                
                const [existsRows] = await pool.query(userinfoexists, [req.session.user]);

                if (existsRows[0].user_exists === 0) {
                    await pool.query(userinfoInsertOnlyId, [req.session.user]);
                }
                
                await pool.query(updateLastLoginQuery, [req.session.user]);

                res.redirect('/storeInfo');
                return;
            }
        }
        
        // ユーザーが存在しない、またはパスワード不一致の場合
        res.render("loginAuthRwsult", { data: LogonFail });

    } catch (error) {
        console.error("Login error:", error);
        res.status(500).send("Internal Server Error");
    }
});

router.get("/regi", (req, res) => res.render("Register"));

router.post("/newUser", async (req, res) => {
    try {
        const [rows] = await pool.query(IdCHK, [req.body.new_username]);
        const new_username = req.body.new_username;
        const new_password = req.body.new_password;
        const confirm_new_password = req.body.confirm_new_password;

        if (rows[0].userid_check) {
            return res.render("regiNotion", { notionComment: "そのIDはすでに登録済みです" });
        }
        if (new_password !== confirm_new_password) {
            return res.render("regiNotion", { notionComment: "パスワードが一致しません" });
        }

        // ★★★ パスワードをハッシュ化（ソルト付与） ★★★
        const hashedPassword = await bcrypt.hash(new_password, saltRounds);

        // ハッシュ化されたパスワードを保存
        await pool.query(userInsert, [new_username, hashedPassword]);
        res.render("regiNotion", { notionComment: "登録が完了しました" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;