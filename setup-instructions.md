# FUJI Photo Renamer セットアップ手順

## 1. 前提条件

このアプリケーションを実行するには以下のソフトウェアが必要です：

### Node.js のインストール
- [Node.js公式サイト](https://nodejs.org/)から最新のLTS版をダウンロード
- macOS: `.pkg`ファイルをダウンロードしてインストール
- Windows: `.msi`ファイルをダウンロードしてインストール

### 確認方法
ターミナル（macOS）またはコマンドプロンプト（Windows）で以下のコマンドを実行：

```bash
node --version
npm --version
```

両方でバージョンが表示されればインストール完了です。

## 2. プロジェクトのセットアップ

### 2.1 ソースコードの準備
1. `fuji-photo-renamer-source.zip` を任意のフォルダに展開
2. ターミナル/コマンドプロンプトで展開したフォルダに移動

### 2.2 依存関係のインストール
```bash
npm install
```

このコマンドで必要なライブラリが自動的にインストールされます。

## 3. アプリケーションの実行

### 3.1 開発環境での実行
```bash
npm start
```

### 3.2 配布用アプリケーションのビルド

#### 自動ビルド（推奨）
macOS:
```bash
chmod +x build.sh
./build.sh
```

Windows:
```
build.bat
```

#### 手動ビルド
全プラットフォーム:
```bash
npm run build-all
```

macOSのみ:
```bash
npm run build-mac
```

Windowsのみ:
```bash
npm run build-win
```

## 4. 配布用ファイルの場所

ビルドが完了すると、`dist` フォルダに以下のファイルが作成されます：

### macOS
- `FUJI Photo Renamer-1.0.0.dmg` - インストーラー
- `FUJI Photo Renamer-1.0.0-mac.zip` - ZIP形式

### Windows
- `FUJI Photo Renamer Setup 1.0.0.exe` - インストーラー
- `FUJI Photo Renamer-1.0.0-win.zip` - ZIP形式

## 5. トラブルシューティング

### Node.js関連のエラー
- Node.jsを再インストールしてください
- 管理者権限で実行してみてください

### 依存関係のインストールエラー
```bash
npm cache clean --force
npm install
```

### ビルドエラー
```bash
# node_modulesを削除して再インストール
rm -rf node_modules
npm install
```

### macOSでのPermissionエラー
```bash
chmod +x build.sh
sudo ./build.sh
```

### Windowsでのビルドエラー
- 管理者権限でコマンドプロンプトを開いて実行
- Windows Defenderの除外設定を確認

## 6. 配布方法

### 個人での配布
1. `dist` フォルダのファイルを配布
2. 受け取った人はそのまま実行可能

### 開発者向け配布
1. ソースコードZIPを作成: `npm run create-zip`
2. 作成された `fuji-photo-renamer-source.zip` を配布
3. 受け取った人は本手順に従ってセットアップ

## 7. 注意事項

- 初回ビルド時は時間がかかる場合があります
- インターネット接続が必要です（依存関係のダウンロードのため）
- macOSでは署名されていないアプリケーションの実行時に警告が出る場合があります
- Windowsでは Windows Defender が警告を出す場合があります

## 8. よくある質問

### Q: アプリが起動しない
A: Node.jsがインストールされているか確認してください。また、依存関係が正しくインストールされているか確認してください。

### Q: ビルドに失敗する
A: node_modulesフォルダを削除してから `npm install` を再実行してください。

### Q: macOSでアプリが開けない
A: システム環境設定 > セキュリティとプライバシー > 一般で「このまま開く」を選択してください。

### Q: 大きなファイルサイズになる
A: Electronアプリケーションは実行に必要なランタイムを含むため、サイズが大きくなります。これは正常な動作です。