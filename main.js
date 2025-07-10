const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const { exiftool } = require('exiftool-vendored');
const { XMLParser } = require('fast-xml-parser');

// フィルムシミュレーション名
const fsNameProvia = 'PROVIA';
const fsNameVelvia = 'Velvia';
const fsNameAstia = 'ASTIA';
const fsNameClassicChrome = 'CLASSIC CHROME';
const fsNameRalaAce = 'REALA ACE';
const fsNameProNegHi = 'PRO Neg Hi';
const fsNameProNegStd = 'PRO Neg Std';
const fsNameClassicNeg = 'CLASSIC Neg';
const fsNameNostalgicNeg = 'NOSTALGIC Neg';
const fsNameEterna = 'ETERNA';
const fsNameEternaBleachBypass = 'ETERNA BLEACH BYPASS';
const fsNameAcros = 'ACROS';
const fsNameAcrosYeFilter = 'ACROS+Ye Filter';
const fsNameAcrosRFilter = 'ACROS+R Filter';
const fsNameAcrosGFilter = 'ACROS+G Filter';
const fsNameMonochrome = 'Monochrome';
const fsNameMonochromeYeFilter = 'Monochrome+Ye Filter';
const fsNameMonochromeRFilter = 'Monochrome+R Filter';
const fsNameMonochromeGFilter = 'Monochrome+G Filter';
const fsNameSepia = 'SEPIA';

// フィルムシミュレーション名変換テーブル
const FILM_SIMULATIONS = {
  JPG: new Map([
    ['F0/Standard (Provia)', fsNameProvia],
    ['F2/Fujichrome (Velvia)', fsNameVelvia],
    ['F1b/Studio Portrait Smooth Skin Tone (Astia)', fsNameAstia],
    ['Classic Chrome', fsNameClassicChrome],
    ['Reala ACE', fsNameRalaAce],
    ['Pro Neg. Hi', fsNameProNegHi],
    ['Pro Neg. Std', fsNameProNegStd],
    ['Classic Negative', fsNameClassicNeg],
    ['Nostalgic Neg', fsNameNostalgicNeg],
    ['Eterna', fsNameEterna],
    ['Bleach Bypass', fsNameEternaBleachBypass],
    ['Acros', fsNameAcros],
    ['Acros Yellow Filter', fsNameAcrosYeFilter],
    ['Acros Red Filter', fsNameAcrosRFilter],
    ['Acros Green Filter', fsNameAcrosGFilter],
    ['None (B&W)', fsNameMonochrome],
    ['B&W Yellow Filter', fsNameMonochromeYeFilter],
    ['B&W Red Filter', fsNameMonochromeRFilter],
    ['B&W Green Filter', fsNameMonochromeGFilter],
    ['B&W Sepia', fsNameSepia],
  ]),
  RAW: new Map([
    ['Camera PROVIA/Standard', fsNameProvia],
    ['Camera Velvia/Vivid', fsNameVelvia],
    ['Camera ASTIA/Soft', fsNameAstia],
    ['Camera CLASSIC CHROME', fsNameClassicChrome],
    ['Camera REALA ACE', fsNameRalaAce],
    ['Camera REALA ACE v2', fsNameRalaAce],
    ['Camera Pro Neg Hi', fsNameProNegHi],
    ['Camera Pro Neg Std', fsNameProNegStd],
    ['Camera CLASSIC Neg', fsNameClassicNeg],
    ['Camera NOSTALGIC Neg', fsNameNostalgicNeg],
    ['Camera ETERNA/Cinema', fsNameEterna],
    ['Camera BLEACH BYPASS', fsNameEternaBleachBypass],
    ['Camera ACROS', fsNameAcros],
    ['Camera ACROS+Ye Filter', fsNameAcrosYeFilter],
    ['Camera ACROS+R Filter', fsNameAcrosRFilter],
    ['Camera ACROS+G Filter', fsNameAcrosGFilter],
    ['Camera Monochrome', fsNameMonochrome],
    ['Camera Monochrome+Ye Filter', fsNameMonochromeYeFilter],
    ['Camera Monochrome+R Filter', fsNameMonochromeRFilter],
    ['Camera Monochrome+G Filter', fsNameMonochromeGFilter],
    ['Camera Sepia', fsNameSepia],
  ]),
};

let mainWindow;
let userDataPath;

/**
 * メインウインドウ作成
 */
function createWindow() {
  const icon = path.join(__dirname, 'assets/icon.svg');
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 800,
    minWidth: 700, // 最小幅を設定
    minHeight: 600, // 最小高さを設定
    icon: icon,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  if (app.isPackaged) {
    exiftool.options.exiftoolPath = path.join(process.resourcesPath, 'bin/exiftool');
  }
  userDataPath = app.getPath('userData');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// フォルダ選択ダイアログ
ipcMain.handle('select-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  });
  return result.filePaths[0] || null;
});

// 設定の保存
ipcMain.handle('save-settings', async (event, settings) => {
  try {
    const settingsPath = path.join(userDataPath, 'settings.json');
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// 設定の読み込み
ipcMain.handle('load-settings', async () => {
  try {
    const settingsPath = path.join(userDataPath, 'settings.json');
    if (fs.existsSync(settingsPath)) {
      const data = fs.readFileSync(settingsPath, 'utf8');
      return JSON.parse(data);
    }
    return null;
  } catch (error) {
    return null;
  }
});

// ファイル/フォルダの情報を取得
ipcMain.handle('get-file-info', async (event, filePath) => {
  try {
    const stats = await fs.stat(filePath);
    return {
      path: filePath,
      isDirectory: stats.isDirectory()
    };
  } catch (error) {
    return { error: error.message };
  }
});

// ドロップされたファイルのパスを取得
ipcMain.handle('get-dropped-files', async (event, files) => {
  return files.map(file => file.path);
});

let isConversionCancelled = false;

// キャンセル処理
ipcMain.on('cancel-conversion', () => {
  isConversionCancelled = true;
});

// ファイルリネーム処理
ipcMain.handle('rename-files', async (event, options) => {
  isConversionCancelled = false; // 処理開始時にリセット
  let { jpegPath, excludeStrings, backup, skipSameLensMaker, fileNameFormat } = options;
  if (!fileNameFormat) {
    fileNameFormat = '{YYYY}{MM}{DD}_{HH}{mm}{ss}_{CameraMaker}_{CameraModel}_{LensMaker}_{LensModel}_{FilmSimulation}_{OriginalName}';
  }
  let { rawPath } = options;

  

  // rawPathが指定されていない場合、jpegPathの一つ上の階層を見る
  if (!rawPath) {
    rawPath = path.join(jpegPath, '..');
  }
  
  try {
    const jpegFiles = (await fs.readdir(jpegPath))
      .filter(file => /\.(jpg|jpeg)$/i.test(file))
      .map(file => path.join(jpegPath, file));
    
    if (jpegFiles.length === 0) {
      throw new Error('JPEGファイルが見つかりません');
    }

    if (backup) {
      const backupPath = path.join(jpegPath, 'backup');
      fs.ensureDirSync(backupPath);
      for (const jpegFile of jpegFiles) {
        if (isConversionCancelled) break;
        const backupFilePath = path.join(backupPath, path.basename(jpegFile));
        if (!fs.existsSync(backupFilePath)) {
            fs.copyFileSync(jpegFile, backupFilePath);
        }
      }
    }

    const results = [];
    const MAX_RETRIES = 3;
    
    for (let i = 0; i < jpegFiles.length; i++) {
      if (isConversionCancelled) {
        results.push({ success: false, fileName: '処理中断', error: 'ユーザーによって処理がキャンセルされました。' });
        break;
      }

      const jpegFile = jpegFiles[i];
      const fileName = path.basename(jpegFile, path.extname(jpegFile));
      
      mainWindow.webContents.send('progress', {
        current: i + 1,
        total: jpegFiles.length,
        message: `処理中: ${path.basename(jpegFile)}`
      });

      let success = false;
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          let exifData;
          let filmSimulationName;
          if (rawPath) {
            const rawFile = await findRawFile(rawPath, fileName);
            if (rawFile) {
              exifData = await getExifFromRawOrXmp(rawFile);
              filmSimulationName = await generateNewFileNameFromRaw(rawPath, rawFile);
            }
          }
          
          if (!exifData) {
            exifData = await exiftool.read(jpegFile);
            filmSimulationName = await generateNewFileNameFromJpg(jpegFile);
          }

          const newFileName = generateNewFileName(fileNameFormat, exifData, fileName, filmSimulationName, excludeStrings, skipSameLensMaker);
          const newFilePath = path.join(jpegPath, newFileName + '.jpg');

          if (filmSimulationName) {
            await exiftool.write(jpegFile, { UserComment: filmSimulationName }, ['-overwrite_original']);
          }

          fs.renameSync(jpegFile, newFilePath);
          
          results.push({
            success: true,
            oldName: path.basename(jpegFile),
            newName: newFileName + '.jpg'
          });
          success = true;
          break; // 成功したらリトライを終了
          
        } catch (error) {
          if (attempt === MAX_RETRIES) {
            results.push({
              success: false,
              fileName: path.basename(jpegFile),
              error: `失敗しました (試行回数: ${attempt}): ${error.message}`
            });
          } else {
            // 失敗した場合、少し待ってから再試行
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
    }

    return { success: true, results };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// RAWファイルを探す
async function findRawFile(rawPath, baseName) {
  const extensions = ['.raf', '.dng', '.xmp'];
  
  for (const ext of extensions) {
    const filePath = path.join(rawPath, baseName + ext);
    try {
      await fs.promises.access(filePath, fs.constants.F_OK); // ファイルの存在を確認
      return filePath;
    } catch (e) {
      // ファイルが存在しない場合は何もしない
    }
  }
  return null;
}

// RAWまたはXMPからEXIFデータを取得
async function getExifFromRawOrXmp(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  
  if (ext === '.xmp') {
    // XMPファイルの場合、EXIFデータを使わないので空
    const result = {};
    return result;
  } else {
    // RAWファイルからEXIFを取得
    return await exiftool.read(filePath);
  }
}

// 新しいファイル名を生成
function generateNewFileName(format, exifData, originalName, filmSimulationName, excludeStrings, skipSameLensMaker) {
  
  let rawDate = exifData.DateTimeOriginal || exifData.CreateDate;
  let date;

  if (rawDate && typeof rawDate.toDate === 'function') {
    // exiftool-vendoredのExifDateTimeオブジェクトをDateに変換
    date = rawDate.toDate();
  } else if (rawDate) {
    // 文字列など、他の形式の場合
    date = new Date(rawDate);
  }

  // dateが無効な場合（パース失敗など）は現在の日時を使用
  if (!date || isNaN(date.getTime())) {
    date = new Date();
  }
  const dateValues = {
    YYYY: date.getFullYear(),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
    DD: String(date.getDate()).padStart(2, '0'),
    HH: String(date.getHours()).padStart(2, '0'),
    mm: String(date.getMinutes()).padStart(2, '0'),
    ss: String(date.getSeconds()).padStart(2, '0'),
  };

  const cameraMake = exifData.Make || 'Unknown';
  const finalLensMake = (skipSameLensMaker && (exifData.LensMake || '') === cameraMake) ? '' : (exifData.LensMake || '');

  const tags = {
    ...dateValues,
    CameraMaker: cameraMake,
    CameraModel: exifData.Model || 'Unknown',
    LensMaker: finalLensMake,
    LensModel: exifData.LensModel || 'Unknown',
    FilmSimulation: filmSimulationName || '',
    OriginalName: originalName,
  };

  let fileName = format;
  for (const [tag, value] of Object.entries(tags)) {
    fileName = fileName.replace(new RegExp(`\\{${tag}\\}`), value);
  }
  
  // 除外文字列を削除
  for (const excludeStr of excludeStrings) {
    if (excludeStr.trim()) {
      fileName = fileName.replace(new RegExp(excludeStr.trim(), 'gi'), '');
    }
  }
  
  // 文字列をクリーンアップ
  fileName = cleanString(fileName);
  return fileName;
}


async function generateNewFileNameFromJpg(jpegPath)
{
  const exifData = await exiftool.read(jpegPath);
  const simKey = exifData.FilmMode ?? exifData.Saturation;
  const sim = FILM_SIMULATIONS.JPG.get(simKey);

  return sim;
}

async function generateNewFileNameFromRaw(rawDirectory, rawFile)
{
  let filmSimulationName;
  const baseName = path.parse(rawFile).name;
  const xmpPath = path.join(rawDirectory, `${baseName}.xmp`);
  if (await fs.pathExists(xmpPath)) {
    // 通常のRAWでXMPサイドカー使用時
    const xml = await fs.readFile(xmpPath, 'utf-8');
    const parser = new XMLParser({
        ignoreAttributes: false, // 属性をパース対象に含める
        attributeNamePrefix: "@_", // 属性名のプレフィックス
    });
    const data = parser.parse(xml);
    const desc = data?.['x:xmpmeta']?.['rdf:RDF']?.['rdf:Description'];

    // crs:CameraProfile が要素として存在するか、属性として存在するかを確認
    const unmodifiedProfile = desc?.['crs:CameraProfile'] || desc?.['@_crs:CameraProfile'];

    // フィルムシミュレーションを変更している場合
    const modifiedProfile = desc['crs:CameraProfile'] || desc['@_crs:CameraProfile'];

    // 変更後を優先
    const profile = modifiedProfile ?? unmodifiedProfile;
    filmSimulationName = FILM_SIMULATIONS.RAW.get(profile);
  } else {
    // DNG（LrCの強化、およびPureRAWを想定）
    // RAFのフォルダ/現像　という構造前提（現像にJPEGを書き出している）
    const rawFiles = await fs.readdir(rawDirectory);
    const dngFile = rawFiles.find(f => f.startsWith(baseName) && f.endsWith('.dng'));
    if (!dngFile) return;

    const tags = await exiftool.read(path.join(rawDirectory, dngFile));

    // フィルムシミュレーションを変更していない場合のプロファイル
    const unmodifiedProfile = tags.CameraProfile;

    // フィルムシミュレーションを変更している場合のプロファイル
    const modifiedProfile = tags.Look?.Name;

    const profile = modifiedProfile ?? unmodifiedProfile
    filmSimulationName = FILM_SIMULATIONS.RAW.get(profile);
  }

  return filmSimulationName;
}

// 日付フォーマット
function formatDate(date) {
  if (typeof date === 'string') {
    date = new Date(date);
  }
  
  if (!(date instanceof Date) || isNaN(date)) {
    date = new Date();
  }
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  
  return `${year}${month}${day}_${hours}${minutes}${seconds}`;
}

// 文字列をクリーンアップ
function cleanString(str) {
  if (!str) return '';

  // ファイル名に使用できない文字を削除
  str = str.replace(/[\\/:*?"<>|]/g, '');

  // スペースをハイフンに
  str = str.replace(/\s+/g, '-');

  // テレコン使用時を考慮
  str = str.replace(/-+\+-+/g, '+');

  // 連続するアンダースコアを単一に
  str = str.replace(/_+/g, '_');
  
  // 先頭と末尾のアンダースコアを削除
  str = str.replace(/^_+|_+$/g, '');
  
  return str;
}

// アプリ終了時にexiftoolを終了
app.on('before-quit', async () => {
  await exiftool.end();
});