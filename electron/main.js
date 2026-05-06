const { app, BrowserWindow, ipcMain, Notification } = require('electron')
const path = require('path')

const isDev = process.env.NODE_ENV !== 'production'

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 400,
    height: 600,
    resizable: true,
    minWidth: 360,
    minHeight: 550,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1a1a2e',
    show: false,
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    // mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '..', 'dist', 'index.html'))
  }

  // 先隐藏窗口等页面就绪再显示，避免启动白屏
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  // macOS：所有窗口关闭后点击 Dock 图标需重建窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  // macOS 惯例：关闭窗口不退出应用，其他平台则退出
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('send-notification', (_event, title, body) => {
  if (Notification.isSupported()) {
    const notification = new Notification({ title, body, silent: false })
    notification.show()
    notification.on('click', () => {
      if (mainWindow) mainWindow.focus()
    })
  }
})
