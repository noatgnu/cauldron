import {app, BrowserWindow, screen, Menu, ipcMain, dialog} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as main from '@electron/remote/main'
import {platform} from "os";
import * as child_process from "child_process";

const translateOSPlatform = (platform: string) => {
  switch (platform) {
    case 'darwin':
      return 'darwin';
    case 'win32':
      return 'win';
    case 'linux':
      return 'linux';
    default:
      return platform;
  }
}

const appPath = app.getAppPath().replace(path.sep + "app.asar", "")

let pyPath = ""
const pythonPathList = [
  [appPath, "resources", "bin", translateOSPlatform(platform()), "python", "python.exe"].join(path.sep),
  path.join(__dirname, "bin", translateOSPlatform(platform()), "python", "python.exe").replace(path.sep + "app.asar", ""),
]

for (const pythonPath of pythonPathList) {
  if (fs.existsSync(pythonPath.replace(path.sep + "app.asar", ""))) {
    pyPath = pythonPath
    break
  }
}


if (pyPath === "") {
  console.error("Could not find python executable")
  process.exit(1)
}

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');
main.initialize()

const osMac = process.platform === 'darwin';

const menuTemplate = [
  ...(osMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }]:[]),
  {
    label: 'File',
    submenu: [
      osMac ? { role: 'close' } : { role: 'quit' },
      {
        label: 'Create Annotation File',
        click: async () => {
          win?.webContents.send('file', 'create-annotation-file')
        }
      }
      ]
  },
  {
    label: 'UniProt',
    submenu: [
      {
        label: 'Add UniProt Data',
        click: async () => {
          win?.webContents.send('uniprot', 'add')
        }
      }
    ]
  },
  {
    label: 'DIA-NN',
    submenu: [
      {
        label: 'Calculate CV',
        click: async () => {
          win?.webContents.send('diann', 'cv')
        }
      }
    ]
  },
  {
    label: 'Data Transformation',
    submenu: [
      {
        label: 'Impute Missing Values',
        click: async () => {
          win?.webContents.send('data-transformation', 'impute-missing-values')
        }
      },
      {
        label: 'Normalize Data',
        click: async () => {
          win?.webContents.send('data-transformation', 'normalize-data')
        }
      }
    ]
  },
  {
    label: 'Dimensionality Reduction',
    submenu: [
      {
        label: 'PCA',
        click: async () => {
          win?.webContents.send('dimensionality-reduction', 'pca')
        }
      },
      {
        label: 'PHATE',
        click: async () => {
          win?.webContents.send('dimensionality-reduction', 'phate')
        }
      },
      {
        label: 'Correlation Matrix',
        click: async () => {
          win?.webContents.send('dimensionality-reduction', 'correlation-matrix')
        }
      }
    ]
  },
  {
    label: 'Citation Utility',
    submenu: [
      {
        label: 'Protocols.io to RIS Files',
        click: async () => {
          win?.webContents.send('citation-utility', 'generate-ris-citation')
        }
      }
    ]
  },
  {
    label: 'Curtain',
    submenu: [
      {
        label: 'Convert DIA-NN to CurtainPTM',
        click: async () => {
          win?.webContents.send('curtain', 'convert-diann-to-curtainptm')
        }
      },
      {
        label: 'Convert MSFragger to CurtainPTM',
        click: async () => {
          win?.webContents.send('curtain', 'convert-msfragger-to-curtainptm')
        }
      }
    ]
  },
  {
    label: 'Differential Analysis',
    submenu: [
      {
        label: 'limma',
        click: async () => {
          win?.webContents.send('differential-analysis', 'limma')
        }
      },
      {
        label: 'QFeatures + limma',
        click: async () => {
          win?.webContents.send('differential-analysis', 'qfeatures-limma')
        }
      }
    ]
  }
  ,
  {
    label: 'Help',
    submenu: [

    ]
  },
  {
    label: 'Toggle Developer Tools',
    accelerator: (function() {
      if (process.platform === 'darwin')
        return 'Alt+Command+I';
      else
        return 'Ctrl+Shift+I';
    })(),
    click: async (item: any, focusedWindow: any) => {
      if (focusedWindow)
        focusedWindow.toggleDevTools();
    }
  },
]

Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate as any))

function createWindow(): BrowserWindow {

  const size = screen.getPrimaryDisplay().workAreaSize;

  // Create the browser window.
  win = new BrowserWindow({
    title: 'Cauldron - For mixing up visualization',
    x: 0,
    y: 0,
    width: size.width,
    height: size.height,
    frame: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      nodeIntegration: true,
      allowRunningInsecureContent: (serve),
      contextIsolation: false,
    },
    icon: path.join(__dirname, 'favicon.ico')
  });
  main.enable(win.webContents)

  if (serve) {
    const debug = require('electron-debug');
    debug();

    require('electron-reloader')(module);
    win.loadURL('http://localhost:4200');
  } else {
    // Path when running electron executable
    let pathIndex = './index.html';

    if (fs.existsSync(path.join(__dirname, '../dist/index.html'))) {
       // Path when running electron in local folder
      pathIndex = '../dist/index.html';
    }

    const url = new URL(path.join('file:', __dirname, pathIndex));
    win.loadURL(url.href);
  }

  win.on('close', (e) => {
    e.preventDefault()
    win?.webContents.send('close', 'close')
    dialog.showMessageBox({
      type: 'question',
      buttons: ['Yes', 'cancel'],
      title: 'Confirm',
      message: 'Are you sure you want to quit?'
    }).then(result => {
      if (result.response === 0) {
        win?.webContents.send('shutdown', 'shutdown')
      }
    })
  })

  // Emitted when the window is closed.
  win.on('closed', () => {
    // Dereference the window object, usually you would store window
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null;
  });

  return win;
}

try {
  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));

  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()

    }
  });

  ipcMain.on('uniprot-add', (event, arg) => {
    console.log(arg)
  })

  ipcMain.on('get-python-path', (event, arg) => {
    win?.webContents.send('python-path',pyPath)
  })

  ipcMain.on('get-process-resource-path', (event, arg) => {
    win?.webContents.send('process-resource-path', __dirname)
  })

  ipcMain.on('install-python-packages', (event, arg) => {
    const installProgress = child_process.spawn(`${pyPath}`, ['-m', 'pip', 'install', '-r', `${__dirname.replace(path.sep+"app.asar", "") + path.sep + 'requirements.txt'}`])
    installProgress.stdout.on('data', (data) => {
      win?.webContents.send('install-python-packages-progress', data.toString())
    })
    installProgress.stderr.on('data', (data) => {
      win?.webContents.send('install-python-packages-progress', data.toString())
    })
    installProgress.on('close', (code) => {
      win?.webContents.send('install-python-packages-progress', `Installation exited with code ${code}`)
    })
  })

  ipcMain.on('shutdown-complete', (event, arg) => {
    win?.destroy()
    app.quit()
  })
} catch (e) {
  // Catch Error
  // throw e;
}
