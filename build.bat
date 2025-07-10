@echo off
chcp 65001 > nul

echo FUJI Photo Renamer - ビルドスクリプト
echo ===============================

REM プロジェクトルートディレクトリに移動
cd /d "%~dp0"

REM Node.jsとnpmがインストールされているかチェック
node --version > nul 2>&1
if %errorlevel% neq 0 (
    echo エラー: Node.jsがインストールされていません
    echo https://nodejs.org/ からNode.jsをインストールしてください
    pause
    exit /b 1
)

npm --version > nul 2>&1
if %errorlevel% neq 0 (
    echo エラー: npmがインストールされていません
    pause
    exit /b 1
)

echo Node.js バージョン: 
node --version
echo npm バージョン: 
npm --version
echo.

REM 依存関係のインストール
echo 依存関係をインストール中...
npm install

if %errorlevel% neq 0 (
    echo エラー: 依存関係のインストールに失敗しました
    pause
    exit /b 1
)

echo.
echo ビルドを開始します...

REM プラットフォームを選択
echo ビルドするプラットフォームを選択してください:
echo 1) macOS のみ
echo 2) Windows のみ
echo 3) macOS と Windows 両方
echo 4) 開発用起動

set /p choice="選択してください (1-4): "

if "%choice%"=="1" (
    echo macOS用にビルド中...
    npm run build-mac
) else if "%choice%"=="2" (
    echo Windows用にビルド中...
    npm run build-win
) else if "%choice%"=="3" (
    echo 全プラットフォーム用にビルド中...
    npm run build-all
) else if "%choice%"=="4" (
    echo 開発用に起動中...
    npm start
    exit /b 0
) else (
    echo 無効な選択です
    pause
    exit /b 1
)

if %errorlevel% equ 0 (
    echo.
    echo ビルドが完了しました！
    echo ビルドされたファイルは dist フォルダにあります。
    echo.
    echo 配布用ファイル:
    if exist "dist" (
        dir dist
    )
) else (
    echo エラー: ビルドに失敗しました
)

pause