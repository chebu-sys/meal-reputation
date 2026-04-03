// /src/routes/userinfo.js の内容をこれで完全に置き換えてください

const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer');
const path = require('path');

// ---------------- multer 設定 ----------------
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads/');
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname);
		cb(null, req.session.user + ext);
	}
});
const upload = multer({ storage: storage });

// ---------------- SQL ----------------
// userinfoテーブルのカラム名は「user_id」で統一されています。
const userinfoexists = 'SELECT EXISTS(SELECT * FROM userinfo WHERE user_id = ?) AS user_exists';
const userInfoQuary = 'SELECT user_id, nickname, gender, bio, region, profile_image, favorite_food, last_login_at FROM userinfo WHERE user_id = ?';
const userInfoInsert = 'INSERT INTO userinfo (user_id, nickname, gender, bio, region, profile_image, favorite_food) VALUES (?, ?, ?, ?, ?, ?, ?)';
const userUpdate = 'UPDATE userinfo SET nickname = ?, gender = ?, bio = ?, region = ?, profile_image = ?, favorite_food = ? WHERE user_id = ?';

// いいね総数を取得するクエリ
const totalLikesQuery = `
    SELECT 
        COUNT(rl.rating_id) AS totalLikesReceived
    FROM 
        review_likes rl
    JOIN 
        ratings r ON rl.rating_id = r.rating_id
    WHERE 
        r.user_id = ? 
`;

// 【新規追加】: レビュー数と平均評価点を取得するクエリ
const reviewStatsQuery = `
    SELECT 
        COUNT(rating_id) AS totalReviews, 
        AVG(score) AS averageScore 
    FROM 
        ratings 
    WHERE 
        user_id = ?
`;

// ---------------- グローバル ----------------
const mens = "男性";
const womens = "女性";
const prefectures = [
	"北海道","青森県","岩手県","宮城県","秋田県","山形県","福島県","茨城県","栃木県","群馬県",
	"埼玉県","千葉県","東京都","神奈川県","新潟県","富山県","石川県","福井県","山梨県","長野県",
	"岐阜県","静岡県","愛知県","三重県","滋賀県","京都府","大阪府","兵庫県","奈良県","和歌山県",
	"鳥取県","島根県","岡山県","広島県","山口県","徳島県","香川県","愛媛県","高知県","福岡県",
	"佐賀県","長崎県","熊本県","大分県","宮崎県","鹿児島県","沖縄県"
];

// 日時整形ヘルパー関数
const formatDate = (dateString) => {
	if (!dateString) return '未記録';
	const date = new Date(dateString);
	if (isNaN(date.getTime())) return '無効な日付';
	
	const Y = date.getFullYear();
	const M = String(date.getMonth() + 1).padStart(2, '0');
	const D = String(date.getDate()).padStart(2, '0');
	const h = String(date.getHours()).padStart(2, '0');
	const m = String(date.getMinutes()).padStart(2, '0');

	return `${Y}/${M}/${D} ${h}:${m}`;
};

// ---------------- 性別フラグをDB値に変換するヘルパー関数 ----------------
const convertGenderToDB = (genderValue) => {
	if (genderValue === '1') {
		return 1; // 男性
	} else if (genderValue === '2' || genderValue === '0') {
		return 0; // 女性
	}
	return null; // 未選択/空文字の場合は NULL
};

// ---------------- 地域をDB値に変換するヘルパー関数 ----------------
const convertRegionToDB = (regionValue) => {
	return (regionValue === '') ? null : regionValue;
};


// ---------------- ユーザー情報取得 ----------------
router.get("/", async (req, res) => {
	if (!req.session.user) return res.redirect('/login');
    const userId = req.session.user;

	const [existsRows] = await pool.query(userinfoexists, [userId]);

	if (existsRows[0].user_exists === 0) {
		res.render("userinfo", { 
			registFrag: 1, 
			editFrag: 0, 
			prefectures, 
			favorite_food: [], 
			userid: userId,
            nickname: '',
            region: null,
            bio: '',
            profile_image: null,
            gender: null,
            last_login_date: '未記録',
            totalLikesReceived: 0,
            totalReviews: 0,
            averageScore: "0.0"
		});
	} else {
		const [rows] = await pool.query(userInfoQuary, [userId]);
		const info = rows[0];

        const [likesRows] = await pool.query(totalLikesQuery, [userId]);
        const totalLikesReceived = likesRows[0].totalLikesReceived;

        const [statsRows] = await pool.query(reviewStatsQuery, [userId]);
        const totalReviews = statsRows[0].totalReviews || 0;
        const averageScore = statsRows[0].averageScore ? parseFloat(statsRows[0].averageScore).toFixed(1) : "0.0";

		let foods = [];
		try { foods = info.favorite_food ? JSON.parse(info.favorite_food) : []; } catch { foods = []; }
		
		let genderDisplay = '未設定';
		if (info.gender === 1) {
			genderDisplay = mens;
		} else if (info.gender === 0) {
			genderDisplay = womens;
		}
		
		const lastLoginDate = formatDate(info.last_login_at);

		res.render("userinfo", {
			registFrag: 0,
			userid: info.user_id,
			nickname: info.nickname,
			region: info.region,
			gender: genderDisplay,
			bio: info.bio,
			profile_image: info.profile_image,
			favorite_food: foods,
			prefectures,
			last_login_date: lastLoginDate,
            totalLikesReceived: totalLikesReceived,
            totalReviews: totalReviews,
            averageScore: averageScore
		});
	}
});

// ---------------- 初回登録 ----------------
router.post('/register', upload.single('profile_image'), async (req, res) => {
	if (!req.session.user) return res.redirect('/login');

	const genderForDB = convertGenderToDB(req.body.gender);
	const regionForDB = convertRegionToDB(req.body.region);
	
	const imagePath = req.file ? '/uploads/' + req.file.filename : null;
	
    let foods = [];
    try {
        const parsedFoods = JSON.parse(req.body.favorite_food);
        if (Array.isArray(parsedFoods)) {
            foods = parsedFoods.slice(0, 3); 
        }
    } catch (e) {
        console.error("Favorite food parsing error:", e);
    }

	await pool.query(userInfoInsert, [
		req.session.user,
		req.body.nickname,
		genderForDB,
		req.body.bio,
		regionForDB,
		imagePath,
		JSON.stringify(foods) 
	]);

	res.redirect('/login/userinfo');
});

// ---------------- 編集画面 ----------------
router.get('/edit', async (req, res) => {
	if (!req.session.user) return res.redirect('/login');

	const [rows] = await pool.query(userInfoQuary, [req.session.user]);
	const info = rows[0];

	let foods = [];
	try { foods = info.favorite_food ? JSON.parse(info.favorite_food) : []; } catch { foods = []; }

	let genderFlagForEJS = null;
	if (info.gender === 1) {
		genderFlagForEJS = 1;
	} else if (info.gender === 0) {
		genderFlagForEJS = 0;
	}
	
	res.render("userinfo", {
		registFrag: 1,
		editFrag: 1,
		genderFlag: genderFlagForEJS,
		nickname: info.nickname,
		region: info.region,
		bio: info.bio,
		profile_image: info.profile_image,
		favorite_food: foods,
		prefectures
	});
});

// ---------------- 編集更新 ----------------
router.post('/update', upload.single('profile_image'), async (req, res) => {
	if (!req.session.user) return res.redirect('/login');
	
	const genderForDB = convertGenderToDB(req.body.gender);
	const regionForDB = convertRegionToDB(req.body.region);
	
	const [currentInfo] = await pool.query(userInfoQuary, [req.session.user]);
	const currentImagePath = currentInfo[0].profile_image;

	let imagePath = req.file ? '/uploads/' + req.file.filename : currentImagePath;
	
    let foods = [];
    try {
        const parsedFoods = JSON.parse(req.body.favorite_food);
        if (Array.isArray(parsedFoods)) {
            foods = parsedFoods.slice(0, 3);
        }
    } catch (e) {
        console.error("Favorite food parsing error:", e);
    }

	await pool.query(userUpdate, [
		req.body.nickname,
		genderForDB,
		req.body.bio,
		regionForDB,
		imagePath,
		JSON.stringify(foods),
		req.session.user
	]);

	res.redirect('/login/userinfo');
});

// ---------------- アカウント削除 (ここを確実に修正しました) ----------------
router.post('/delete', async (req, res) => {
    const userId = req.session.user; 
    
    if (!userId) {
        return res.status(401).send('Unauthorized');
    }

    let connection;
    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // 外部キー制約を回避するために順番に削除
        await connection.query('DELETE FROM review_likes WHERE liker_id = ?', [userId]);
        await connection.query('DELETE FROM review_likes WHERE rating_id IN (SELECT rating_id FROM ratings WHERE user_id = ?)', [userId]);
        await connection.query('DELETE FROM ratings WHERE user_id = ?', [userId]);
        await connection.query('DELETE FROM userinfo WHERE user_id = ?', [userId]);

        // [result] で受け取らないと判定が失敗します
        const [deleteUserResult] = await connection.query('DELETE FROM users WHERE id = ?', [userId]);
        
        if (deleteUserResult.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ error: '削除対象が見つかりませんでした。' });
        }
        
        await connection.commit();

        req.session.destroy(err => {
            if (err) {
                console.error('Session destruction error:', err);
            }
            res.status(200).end(); 
        });

    } catch (error) {
        if (connection) {
            await connection.rollback();
        }
        console.error('Account deletion error:', error);
        res.status(500).json({ error: 'データベースエラーが発生しました。' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

module.exports = router;