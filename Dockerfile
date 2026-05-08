# ベースイメージとしてNode.js 18を使用
FROM node:18-alpine

# コンテナ内の作業ディレクトリ
WORKDIR /home/node/projects

# セキュリティ対策：rootユーザーではなくnodeユーザーを使用
RUN chown -R node:node /home/node/projects
USER node

# アプリケーションの起動（実際の実行はcompose側で上書きされます）
CMD ["node", "src/server.js"]