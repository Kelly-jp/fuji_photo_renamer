const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  renameFiles: (options) => ipcRenderer.invoke('rename-files', options),
  cancelConversion: () => ipcRenderer.send('cancel-conversion'),
  onProgress: (callback) => {
    ipcRenderer.on('progress', (event, ...args) => callback(...args));
  },
  getFileInfo: (filePath) => ipcRenderer.invoke('get-file-info', filePath)
});
