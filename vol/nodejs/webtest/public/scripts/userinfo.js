// /scripts/userinfo.js
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('user-info-form');
    
    // --- 1. グルメ選択数の最大3個制限と「その他」の連動 ---
    if (form) {
        const checkboxes = form.querySelectorAll('input[name="favorite_food_original"]');
        const otherCheckbox = document.getElementById('other-food-checkbox');
        const otherContainer = document.getElementById('other-food-container');
        const otherInput = document.getElementById('other-food-input');
        const outputHiddenField = document.getElementById('favorite-food-output');
        const MAX_SELECTION = 3;

        if (otherCheckbox && otherContainer) {
            otherContainer.style.display = otherCheckbox.checked ? 'block' : 'none';
            otherCheckbox.addEventListener('change', () => {
                otherContainer.style.display = otherCheckbox.checked ? 'block' : 'none';
                if (!otherCheckbox.checked && otherInput) {
                    otherInput.value = '';
                }
            });
        }

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                let checkedCount = 0;
                checkboxes.forEach(c => { if (c.checked) checkedCount++; });
                if (checkedCount > MAX_SELECTION) {
                    checkbox.checked = false;
                    alert(`好きなグルメは最大${MAX_SELECTION}個までです。`);
                }
            });
        });

        form.addEventListener('submit', (e) => {
            let selectedFoods = [];
            checkboxes.forEach(cb => {
                if (cb.checked) {
                    if (cb.value === 'その他' && otherInput && otherInput.value) {
                        selectedFoods.push('その他:' + otherInput.value);
                    } else {
                        selectedFoods.push(cb.value);
                    }
                }
            });
            if (outputHiddenField) {
                outputHiddenField.value = JSON.stringify(selectedFoods);
            }
            checkboxes.forEach(cb => cb.name = 'ignored');
        });
    }

    // --- 2. プロフィール画像プレビュー ---
    const profileImageInput = document.getElementById('profile-image-input');
    const profilePreview = document.getElementById('profile-preview');
    const profilePreviewDefault = document.getElementById('profile-preview-default');

    if (profileImageInput && profilePreview) {
        profileImageInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    profilePreview.src = e.target.result;
                    profilePreview.classList.remove('hidden');
                    if (profilePreviewDefault) profilePreviewDefault.classList.add('hidden');
                }
                reader.readAsDataURL(file);
            }
        });
    }

    // --- 3. アカウント削除ボタンの動作 (ボタンを動かすために追加) ---
    const deleteAccountBtn = document.getElementById('delete-account-button');
    if (deleteAccountBtn) {
        deleteAccountBtn.addEventListener('click', async () => {
            if (!confirm('本当にアカウントを削除しますか？\nこの操作は取り消せません。')) return;

            try {
                const response = await fetch('/login/userinfo/delete', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (response.ok) {
                    alert('アカウントを削除しました。');
                    window.location.href = '/login';
                } else {
                    alert('削除に失敗しました。');
                }
            } catch (error) {
                console.error('通信エラー:', error);
                alert('通信に失敗しました。');
            }
        });
    }
});