/**login.js
 * パスワード入力フィールドの表示・非表示を切り替えます。
 * @param {string} fieldId - 対象となる<input type="password">フィールドのID。
 * @param {HTMLElement} buttonElement - 切り替えボタンの要素。
 */
function togglePasswordVisibility(fieldId, buttonElement) {
    const field = document.getElementById(fieldId);
    if (field.type === 'password') {
        field.type = 'text';
        // 表示状態になったら、「隠す」（目を閉じたアイコン）に変更
        buttonElement.textContent = '🙈'; 
    } else {
        field.type = 'password';
        // 非表示状態に戻ったら、「表示」（目を開けたアイコン）に変更
        buttonElement.textContent = '👁️'; 
    }
}