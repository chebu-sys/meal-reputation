// store.js

const express = require('express');
const router = express.Router();
const pool = require('../db');
const multer = require('multer'); // ★追加
const path = require('path');     // ★追加

// =========================================================================
// 画像アップロード設定 (Multer) - 口コミ用に追加
// =========================================================================
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/reviews/'); 
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, req.session.user + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// =========================================================================
// リファラーチェックミドルウェアはコメントアウトを維持
// =========================================================================
/*
router.use((req, res, next) => {
    const referer = req.headers.referer; 
    if (!referer) {
        console.log(`[Store Router] Direct access to ${req.originalUrl} detected. Redirecting to /`);
        return res.redirect('/'); 
    }
    next();
});
*/

// ページあたりの表示件数を定義
const ITEMS_PER_PAGE = 10;

// SQLクエリの断片
const getStoreBaseQuery = `
    SELECT
        s.store_id,
        s.name,
        s.address,
        s.phone_number,
        s.description,
        s.image_url,
        s.image_width,    
        s.image_height,   
        AVG(r.score) AS average_score
    FROM
        stores s
    LEFT JOIN
        ratings r ON s.store_id = r.store_id
`;

// 店舗詳細取得用のクエリ（平均スコア含む）
const getStoreByIdAndAverageScoreQuery = `
    SELECT 
        s.store_id, s.name, s.address, s.phone_number, s.description, s.image_url, s.image_width, s.image_height, s.company_id,
        AVG(r.score) AS average_score
    FROM stores s
    LEFT JOIN ratings r ON s.store_id = r.store_id
    WHERE s.store_id = ?
    GROUP BY s.store_id, s.name, s.address, s.phone_number, s.description, s.image_url, s.image_width, s.image_height, s.company_id
`;
const getExistingRatingQuery = 'SELECT score, comment, rating_id FROM ratings WHERE user_id = ? AND store_id = ?';
const getMenusByStoreIdQuery = 'SELECT menu_name, price FROM menus WHERE store_id = ? ORDER BY menu_id'; 


// 全評価コメント取得クエリ (ソート対応 + 自分の投稿を最優先)
const getRatingsByStoreIdQuery = (sortBy, userId) => {
    let orderByClause = '';
    
    // ログインしている場合、自分の投稿(user_id = userId)を最優先(1)、それ以外を(0)として降順ソート
    const myFirstSort = userId ? `user_id = ${pool.escape(userId)} DESC, ` : '';

    if (sortBy === 'score') {
        // 評価順 (自分の投稿 -> スコア降順 -> ID降順)
        orderByClause = `ORDER BY ${myFirstSort} score DESC, rating_id DESC`;
    } else {
        // 新規登録順 (自分の投稿 -> ID降順)
        orderByClause = `ORDER BY ${myFirstSort} rating_id DESC`;
    }
    return `
        SELECT rating_id, user_id, score, comment, updated_at, created_at, review_image
        FROM ratings
        WHERE store_id = ?
        ${orderByClause}
    `;
};

// 口コミへのいいね状態を取得するクエリ (ログインユーザーのいいね済みチェック用)
const checkReviewLikeQuery = 'SELECT COUNT(*) AS count FROM review_likes WHERE liker_id = ? AND rating_id = ?';

// 口コミへのいいね件数をカウントするクエリ
const countReviewLikesQuery = 'SELECT COUNT(*) AS total_likes FROM review_likes WHERE rating_id = ?';


// 1. 店舗一覧画面のルート (GET /storeInfo)
router.get("/", async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const offset = (page - 1) * ITEMS_PER_PAGE;
    const genre = req.query.genre || null;
    const filter = req.query.filter; // ★ここを追加
    const search = req.query.search || null;
    const userId = req.session.user || null;
    
    let whereClauses = [];
    let queryParams = [];
    let joinClause = ""; // ★ここを追加

    // ★お気に入り絞り込みの条件を追加
    if (filter === 'favorites' && userId) {
        joinClause = "JOIN favorites f ON s.store_id = f.store_id";
        whereClauses.push("f.user_id = ?");
        queryParams.push(userId);
    } else if (genre && genre !== 'すべて') {
        whereClauses.push("s.genre = ?");
        queryParams.push(genre);
    }
    
    if (search) {
        whereClauses.push("s.name LIKE ?");
        queryParams.push(`%${search}%`);
    }

    const whereCondition = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    try {
        // COUNTクエリに JOIN を含める
        const countQuery = `SELECT COUNT(DISTINCT s.store_id) AS total_count FROM stores s ${joinClause} ${whereCondition}`;
        const [countRows] = await pool.query(countQuery, queryParams);
        const totalCount = countRows[0].total_count;
        
        // メインの取得クエリに JOIN を含める
        let getStoresQuery = `${getStoreBaseQuery} ${joinClause} ${whereCondition} GROUP BY s.store_id, s.name, s.address, s.phone_number, s.description, s.image_url, s.image_width, s.image_height`;
        
        getStoresQuery += search ? ' ORDER BY average_score DESC, s.store_id ASC' : ' ORDER BY (average_score IS NOT NULL) DESC, average_score DESC, s.store_id ASC'; 
        getStoresQuery += ' LIMIT ? OFFSET ?';
        queryParams.push(ITEMS_PER_PAGE, offset);

        const [stores] = await pool.query(getStoresQuery, queryParams);
        
        res.render("StoreIndex", { 
            stores: stores,
            isLoggedIn: !!userId,
            userId: userId,
            currentPage: page,
            totalPages: Math.ceil(totalCount / ITEMS_PER_PAGE),
            selectedGenre: genre,
            selectedFilter: filter, // ★これらを追加してEJS側に渡す
            searchKeyword: search || '',
            isSearching: !!search 
        });
    } catch (error) {
        console.error("Error fetching stores:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 2. 店舗詳細・評価画面のルート (GET /storeInfo/:store_id)
router.get("/:store_id", async (req, res) => {
    const storeId = req.params.store_id;
    const userId = req.session.user; 
    const isLoggedIn = !!userId;
    const sortBy = req.query.sort || 'newest'; 

    try {
        // 1. 店舗情報と平均スコアを取得
        const [storeRows] = await pool.query(getStoreByIdAndAverageScoreQuery, [storeId]);
        const store = storeRows[0];

        if (!store) {
            return res.status(404).send("Store not found.");
        }
        
        // 2. ログインユーザーの既存評価を取得
        let existingRating = null;

        if (isLoggedIn) {
            const [ratingRows] = await pool.query(getExistingRatingQuery, [userId, storeId]);
            existingRating = ratingRows[0] || null;
        }

        // 3. メニューを取得
        const [menuRows] = await pool.query(getMenusByStoreIdQuery, [storeId]);
        const menus = menuRows;
        
        // お気に入り状態のチェック
        let isFavorite = false;
        if (isLoggedIn) {
        const [favRows] = await pool.query(
        'SELECT * FROM favorites WHERE user_id = ? AND store_id = ?',
        [userId, storeId]
    );
    isFavorite = favRows.length > 0;
}

        // 4. 全評価コメントを取得 (ソート適用 + 自分の投稿を最優先)
        const ratingsQuery = getRatingsByStoreIdQuery(sortBy, userId);
        const [ratings] = await pool.query(ratingsQuery, [storeId]);
        
        // いいねの件数と、ログインユーザーのいいね状態を同時に取得する
        if (ratings.length > 0) {
            for (const rating of ratings) {
                // 1. ログインユーザーのいいね状態（ボタン表示用）
                if (isLoggedIn) {
                    try {
                        const [likeRows] = await pool.query(checkReviewLikeQuery, [userId, rating.rating_id]);
                        rating.isLiked = likeRows[0].count > 0;
                        
                        // ★追加：自画自賛防止用のフラグ（自分の投稿かどうか）
                        rating.isMyPost = (rating.user_id === userId);
                        
                    } catch (error) {
                        console.error(`Error checking review like status for rating_id ${rating.rating_id}:`, error);
                        rating.isLiked = false; 
                    }
                } else {
                    rating.isLiked = false;
                    rating.isMyPost = false;
                }
                
                // 2. いいねの総件数（表示用）
                try {
                    const [countRows] = await pool.query(countReviewLikesQuery, [rating.rating_id]);
                    rating.likeCount = countRows[0].total_likes;
                } catch (error) {
                    console.error(`Error counting review likes for rating_id ${rating.rating_id}:`, error);
                    rating.likeCount = 0; // エラー時は0件と見なす
                }
            }
        }
        
        const renderData = { 
            store: store, 
            userId: userId,
            existingRating: existingRating, 
            menus: menus,
            isLoggedIn: isLoggedIn,
            ratings: ratings, 
            sortBy: sortBy,
            isFavorite: isFavorite,
        };

        if (isLoggedIn) {
            res.render("StoreReview", renderData);
        } else {
            // ログインしていない場合は閲覧専用画面を表示
            res.render("StoreDetail", renderData);
        }
    } catch (error) {
        console.error("Error fetching store detail, rating, or menus:", error);
        res.status(500).send("Internal Server Error");
    }
});

// 3. 評価投稿/編集のルート (POST /storeInfo/:store_id/review)
// ★ upload.single('review_image') を追加し、SQLに review_image を追加
const insertRatingQuery = 'INSERT INTO ratings (user_id, store_id, score, comment, review_image) VALUES (?, ?, ?, ?, ?)';
const updateRatingQuery = 'UPDATE ratings SET score = ?, comment = ?, review_image = COALESCE(?, review_image), updated_at = CURRENT_TIMESTAMP WHERE rating_id = ? AND user_id = ? AND store_id = ?';

router.post("/:store_id/review", upload.single('review_image'), async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    
    const storeId = req.params.store_id;
    const userId = req.session.user;
    const score = parseInt(req.body.rating); 
    const comment = req.body.comment;
    const ratingId = req.body.rating_id; 

    // 画像があればそのパス、なければ null
    const imagePath = req.file ? '/uploads/reviews/' + req.file.filename : null;

    if (!score) {
        return res.status(400).send("Rating score is required.");
    }

    try {
        if (ratingId) {
            // 更新時は画像があれば更新、なければ既存維持 (COALESCEを使用)
            await pool.query(updateRatingQuery, [score, comment, imagePath, ratingId, userId, storeId]);
        } else {
            await pool.query(insertRatingQuery, [userId, storeId, score, comment, imagePath]);
        }
        
        res.redirect(`/storeInfo/${storeId}`);

    } catch (error) {
        console.error("Error saving rating:", error);
        res.status(500).send("Failed to save rating.");
    }
});

// 4. 口コミへのいいね追加・解除のルート (POST /storeInfo/review/:rating_id/like)
const insertReviewLikeQuery = 'INSERT INTO review_likes (liker_id, rating_id) VALUES (?, ?)';
const deleteReviewLikeQuery = 'DELETE FROM review_likes WHERE liker_id = ? AND rating_id = ?';

router.post("/review/:rating_id/like", async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const ratingId = req.params.rating_id; 
    const userId = req.session.user; 
    const action = req.body.action; 

    try {
        const [ratingRows] = await pool.query('SELECT user_id FROM ratings WHERE rating_id = ?', [ratingId]);
        if (ratingRows.length > 0 && ratingRows[0].user_id === userId) {
            return res.redirect(req.headers.referer || '/storeInfo');
        }

        if (action === 'add') {
            await pool.query(insertReviewLikeQuery, [userId, ratingId]);
        } else if (action === 'remove') {
            await pool.query(deleteReviewLikeQuery, [userId, ratingId]);
        }
        
        const referer = req.headers.referer || '/storeInfo'; 
        res.redirect(referer + `#review-${ratingId}`); 

    } catch (error) {
        console.error("Error processing review like:", error);
        res.redirect(req.headers.referer || '/storeInfo');
    }
});

// 5. 口コミ削除のルート (POST /storeInfo/:store_id/review/delete)
router.post("/:store_id/review/delete", async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    
    const storeId = req.params.store_id;
    const userId = req.session.user;
    const ratingId = req.body.rating_id;

    try {
        await pool.query('DELETE FROM review_likes WHERE rating_id = ?', [ratingId]);
        await pool.query(
            'DELETE FROM ratings WHERE rating_id = ? AND user_id = ? AND store_id = ?',
            [ratingId, userId, storeId]
        );
        res.redirect(`/storeInfo/${storeId}`);
    } catch (error) {
        console.error("Error deleting rating:", error);
        res.status(500).send("Failed to delete rating.");
    }
});

// 6. お気に入り登録・解除のルート (POST /storeInfo/toggle-favorite)
router.post("/toggle-favorite", async (req, res) => {
    if (!req.session.user) return res.redirect('/login');

    const storeId = req.body.store_id;
    const userId = req.session.user; // セッションに入っている文字列 'TEST' をそのまま使う

    try {
        // すでに登録されているかチェック
        const [existing] = await pool.query(
            'SELECT * FROM favorites WHERE user_id = ? AND store_id = ?',
            [userId, storeId]
        );

        if (existing.length > 0) {
            // 解除処理
            await pool.query('DELETE FROM favorites WHERE user_id = ? AND store_id = ?', [userId, storeId]);
        } else {
            // 登録処理
            await pool.query('INSERT INTO favorites (user_id, store_id) VALUES (?, ?)', [userId, storeId]);
        }
        
        // 元のページへリダイレクト
        res.redirect(req.headers.referer || `/storeInfo/${storeId}`);
    } catch (error) {
        console.error("Error toggling favorite:", error);
        res.status(500).send("Failed to toggle favorite.");
    }
});

module.exports = router;