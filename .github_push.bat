@echo off
chcp 65001 > nul

echo ===================================================
echo   GitHub 完全同期（Push）ツール
echo ===================================================
echo.
echo 【現在の状態を確認します】
git status -s
echo.

set /p COMMIT_MSG="今回の変更内容（コミットメッセージ）を入力してください: "

if "%COMMIT_MSG%"=="" (
    echo [エラー] メッセージが入力されなかったため、処理を中断します。
    pause
    exit /b
)

echo.
echo ===================================================
echo   送信処理を開始します...
echo ===================================================

echo [1/3] 変更されたファイルを集めています... (git add -A)
:: ★ここを git add . から git add -A に変更しました★
git add -A

echo [2/3] 変更内容を記録しています... (git commit)
git commit -m "%COMMIT_MSG%"

echo [3/3] GitHubへ送信しています... (git push)
git push origin main

echo.
echo ===================================================
echo   送信が完了しました！
echo   ローカルで削除したファイルもGitHubから消去されています。
echo ===================================================
pause