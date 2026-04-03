@setlocal
@chcp 65001

docker-compose up -d

rem "何かキーを押すとコンテナの停止と削除およびバッチの自動終了が行われます..."
@pause>NUL

docker-compose down

