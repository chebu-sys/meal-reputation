@echo off
setlocal

echo [1/3] 古いコンテナを掃除しています...
docker-compose down

echo [2/3] Dockerコンテナをバックグラウンドで起動しています...
docker-compose up -d

echo 10秒待機しています（ネットワークとDBの安定待ち）...
timeout /t 10 > nul

echo [3/3] コンテナ内のNode.jsサーバーを起動しています...

:: web1 (nodejs) の起動
:: webtestフォルダに移動してから node src/index.js を実行
docker exec -d nodejs sh -c "cd webtest && node src/index.js"
echo web1 (nodejs) を起動しました。

:: web2 (nodejs2) の起動
:: こちらも構造に合わせて cd するかどうか調整してください
docker exec -d nodejs2 sh -c "cd webtest && node src/index.js"
echo web2 (nodejs2) を起動しました。

echo.
echo ==================================================
echo 起動が完了しました！
echo ユーザー側: http://localhost/
echo 管理者側  : http://localhost/Cologin
echo ==================================================
pause