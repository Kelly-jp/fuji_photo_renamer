#!/bin/bash

echo "FUJI Photo Renamer - ビルドスクリプト"
echo "==============================="

# プロジェクトルートディレクトリに移動
cd "$(dirname "$0")"

# Node.jsとnpmがインストールされているかチェック
if ! command -v node &> /dev/null; then
    echo "エラー: Node.jsがインストールされていません"
    echo "https://nodejs.org/ からNode.jsをインストールしてください"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "エラー: npmがインストールされていません"
    exit 1
fi

echo "Node.js バージョン: $(node --version)"
echo "npm バージョン: $(npm --version)"
echo ""

# 依存関係のインストール
echo "依存関係をインストール中..."
npm install

if [ $? -ne 0 ]; then
    echo "エラー: 依存関係のインストールに失敗しました"
    exit 1
fi

echo ""
echo "ビルドを開始します..."

# プラットフォームを選択
echo "ビルドするプラットフォームを選択してください:"
echo "1) macOS のみ"
echo "2) Windows のみ"
echo "3) macOS と Windows 両方"
echo "4) 開発用起動"

read -p "選択してください (1-4): " choice

case $choice in
    1)
        echo "macOS用にビルド中..."
        npm run build-mac
        ;;
    2)
        echo "Windows用にビルド中..."
        npm run build-win
        ;;
    3)
        echo "全プラットフォーム用にビルド中..."
        npm run build-all
        ;;
    4)
        echo "開発用に起動中..."
        npm start
        exit 0
        ;;
    *)
        echo "無効な選択です"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo "ビルドが完了しました！"
    echo "ビルドされたファイルは dist フォルダにあります。"
    echo ""
    echo "配布用ファイル:"
    if [ -d "dist" ]; then
        ls -la dist/
    fi
else
    echo "エラー: ビルドに失敗しました"
    exit 1
fi