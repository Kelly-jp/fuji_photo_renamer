const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// ZIPファイルを作成する関数
function createZipFile() {
  const outputPath = path.join(__dirname, 'fuji-photo-renamer-source.zip');
  const output = fs.createWriteStream(outputPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // 最高圧縮レベル
  });

  // エラーハンドリング
  output.on('close', function() {
    console.log(`✓ ZIPファイルを作成しました: ${outputPath}`);
    console.log(`  ファイルサイズ: ${(archive.pointer() / 1024 / 1024).toFixed(2)} MB`);
    console.log('
使用方法:');
    console.log('1. ZIPファイルを展開');
    console.log('2. ターミナルで展開したフォルダに移動');
    console.log('3. npm install を実行');
    console.log('4. npm start で開発用起動、またはnpm run build-all でビルド');
  });

  archive.on('warning', function(err) {
    if (err.code === 'ENOENT') {
      console.warn('Warning:', err);
    } else {
      throw err;
    }
  });

  archive.on('error', function(err) {
    throw err;
  });

  // アーカイブをストリームにパイプ
  archive.pipe(output);

  // 含めるファイル
  const filesToInclude = [
    'package.json',
    'main.js',
    'preload.js',
    'index.html',
    'README.md',
    'build.sh',
    'build.bat',
    '.gitignore'
  ];

  // 各ファイルをアーカイブに追加
  filesToInclude.forEach(file => {
    const filePath = path.join(__dirname, file);
    if (fs.existsSync(filePath)) {
      archive.file(filePath, { name: file });
      console.log(`  追加: ${file}`);
    } else {
      console.log(`  スキップ: ${file} (ファイルが見つかりません)`);
    }
  });

  // アーカイブをファイナライズ
  archive.finalize();
}

// 実行


createZipFile();