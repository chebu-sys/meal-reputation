// /home/node/projects/webtest/public/scripts/storeDetail.js の内容をこれで完全に置き換えてください

document.addEventListener('DOMContentLoaded', () => {
    // 全てのいいねボタンを取得
    const likeButtons = document.querySelectorAll('.review-like-btn');

    likeButtons.forEach(button => {
        button.addEventListener('click', async (event) => {
            const ratingId = button.getAttribute('data-rating-id');
            // 対応するカウント表示要素をIDで取得
            const countSpan = document.getElementById(`like-count-${ratingId}`);
            const iconSpan = button.querySelector('.like-icon-display');

            if (!ratingId || !countSpan || !iconSpan) {
                console.error('必要なデータ属性または要素が見つかりません。処理をスキップします。');
                return;
            }

            button.disabled = true; // 連打防止

            try {
                // サーバーAPIにリクエスト送信 (POST /storeInfo/api/review/like)
                const response = await fetch('/storeInfo/api/review/like', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ rating_id: ratingId })
                });

                const data = await response.json();

                if (data.success) {
                    // ★★★ 修正箇所：カウントの更新時に「いいね！」テキストを追加 ★★★
                    countSpan.textContent = `いいね！ ${data.newCount} 件`;
                    
                    // 2. ボタンの状態とアイコンの更新
                    const newIsLiked = data.action === 'liked';
                    // data-is-liked 属性を更新 (CSSがこれを見てスタイルを切り替える)
                    button.setAttribute('data-is-liked', newIsLiked ? 'true' : 'false');
                    // ハートアイコンを更新
                    iconSpan.textContent = newIsLiked ? '❤️' : '🤍';
                    
                } else if (response.status === 401) {
                    // ログインが必要な場合
                    alert('いいねするにはログインが必要です。');
                } else {
                    alert('操作に失敗しました: ' + data.message);
                }
            } catch (error) {
                console.error('いいね操作中の通信エラー:', error);
                alert('通信エラーが発生しました。');
            } finally {
                button.disabled = false;
            }
        });
    });
});