import {app, BrowserWindow, screen, Menu, ipcMain, dialog, ipcRenderer} from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import * as main from '@electron/remote/main'
import {platform} from "os";
import * as child_process from "child_process";
import axios from "axios";
import * as tar from "tar-stream";
import * as zlib from "zlib";

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

let extended_path = ["python.exe"]

if (platform() !== "win32") {
  extended_path = ["bin", "python"]
}

let pyPath = ""
const pythonPathList = [
  [appPath, "resources", "bin", translateOSPlatform(platform()), "python", ...extended_path].join(path.sep),
  path.join(__dirname, "bin", translateOSPlatform(platform()), "python", ...extended_path).replace(path.sep + "app.asar", ""),
]



for (const pythonPath of pythonPathList) {
  if (fs.existsSync(pythonPath.replace(path.sep + "app.asar", ""))) {
    pyPath = pythonPath
    break
  }
}


if (pyPath === "") {
  console.error("Could not find python executable")
  //process.exit(1)
}

let win: BrowserWindow | null = null;
const args = process.argv.slice(1),
  serve = args.some(val => val === '--serve');
main.initialize()
let linkData: string | null = null
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
      {
        label: 'Create Annotation File',
        click: async () => {
          win?.webContents.send('file', 'create-annotation-file')
        }
      },
      osMac ? { role: 'close' } : { role: 'quit' },
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
    label: 'Utilities',
    submenu: [
      {
        label: 'Check Peptides in Library',
        click: async () => {
          win?.webContents.send('utilities', 'check-peptide-in-library')
        }
      },
      {
        label: 'Remap PTM Positions in Protein',
        click: async () => {
          win?.webContents.send('utilities', 'remap-ptm-positions')
        }
      },
      {
        label: 'Coverage Map',
        click: async () => {
          win?.webContents.send('utilities', 'coverage-map')
        }
      }
    ]
  },
  {
    label: 'Statistical Tests',
    submenu: [
      {
        label: 'Estimation Plot',
        click: async () => {
          win?.webContents.send('statistical-tests', 'estimation-plot')
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
        label: 'Fuzzy Clustering (PCA)',
        click: async () => {
          win?.webContents.send('dimensionality-reduction', 'fuzzy-clustering-pca')
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
      },
      {
        label: 'AlphaPeptStats',
        click: async () => {
          win?.webContents.send('differential-analysis', 'alphastats')
        }
      },
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
  if (process.platform !== 'darwin') {
    const url = process.argv.find(arg => arg.startsWith('cauldron:'));
    if (url) {
      linkData = url;

    }
  }
  return win;
}

try {

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  // Added 400 ms to fix the black background issue while using transparent window. More detais at https://github.com/electron/electron/issues/15947
  app.on('ready', () => setTimeout(createWindow, 400));
  app.setAsDefaultProtocolClient('cauldron')
  app.commandLine.appendSwitch('ignore-gpu-blacklist')
  app.on('open-url', (event, url) => {
    event.preventDefault()
    linkData = url
  })


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
  ipcMain.on('get-app-version', (event, arg) => {
    win?.webContents.send('app-version', app.getVersion())
  })
  ipcMain.on('install-python-packages', (event, arg) => {
    console.log(pyPath)
    console.log(['-m', 'pip', 'install', '-r', `${__dirname.replace(path.sep+"app.asar", "") + path.sep + 'requirements.txt'}`])
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

  ipcMain.on('get-link-data', (event, arg) => {
    win?.webContents.send('link-data', linkData)
  })

  ipcMain.on('download-extra', (event, arg) => {
    console.log(arg)
    const url = arg.url
    const tempFolder = arg.tempFolder
    if (!fs.existsSync(tempFolder)) {
      fs.mkdirSync(tempFolder)
    }
    const tempFilePath = path.join(tempFolder, arg.fileName)
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath)
    }
    const file = fs.createWriteStream(tempFilePath);

    axios({
      method: "get",
      url: url,
      headers: {
        'accept': 'application/octet-stream',
      },
      responseType: 'stream'
    }).then((response) => {
      const totalSize = parseInt(response.headers['content-length'], 10);
      let downloadedSize = 0;
      response.data.on('data', (chunk: Buffer) => {
        downloadedSize += chunk.length;
        const progress = (downloadedSize / totalSize) * 100;
        win?.webContents.send('download-extra-message', {total: totalSize, progress: downloadedSize, fileName: arg.fileName, completed: false, percentage: progress, message: `Downloading ${arg.fileName}`, file: null})
      });
      response.data.pipe(file);
      response.data.on('end', () => {
        win?.webContents.send('download-extra-message', {total: totalSize, progress: downloadedSize, fileName: arg.fileName, completed: true, percentage: 100, message: `Downloading ${arg.fileName}`, file: null})
        if (arg.fileName.startsWith("python")) {
          if (fs.existsSync(path.join(tempFolder, "resources", "bin", translateOSPlatform(platform()), "python"))) {
            fs.rmSync(path.join(tempFolder, "resources", "bin", translateOSPlatform(platform()), "python"), {recursive: true})
          }
        } else if (arg.fileName.startsWith("r-portable")) {
          if (fs.existsSync(path.join(tempFolder, "resources", "bin", translateOSPlatform(platform()), "R-Portable"))) {
            fs.rmSync(path.join(tempFolder, "resources", "bin", translateOSPlatform(platform()), "R-Portable"), {recursive: true})
          }
        }


        untarAndUngzip(tempFilePath, tempFolder, arg.fileName, win, arg.appFolder)
      })
    })
  })
} catch (e) {
  // Catch Error
  // throw e;
}


async function copyDirectoryContents(src: string, dest: string) {
  if (!fs.existsSync(src)) {
    throw new Error(`Source directory ${src} does not exist`);
  }

  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  try {
    if (platform() === 'win32') {
      // Use robocopy on Windows
      await child_process.exec(`xcopy "${src}" "${dest}" /s /e /h /y /q`);
    } else {
      // Use cp on Unix-like platforms
      await child_process.exec(`cp -rf "${src}/." "${dest}/"`);
    }
  } catch (e: any) {
    throw new Error(`Error copying directory contents: ${e.message}`);
  }

}


function untarAndUngzip(tempFilePath: string, tempFolder: string, fileName: string, win: BrowserWindow | null, appFolder: string) {
  const extract = tar.extract();
  const gunzip = zlib.createGunzip();
  fs.createReadStream(tempFilePath).pipe(gunzip).pipe(extract);
  let totalEntries = 0;
  let processedEntries = 0;

  extract.on('entry', (header: any, stream: any, next: any) => {
    totalEntries++;
    const filePath = path.join(tempFolder, header.name);
    if (header.type === 'directory') {
      if (!fs.existsSync(filePath)) {
        fs.mkdirSync(filePath, { recursive: true });
      }
      processedEntries++;
      const progress = (processedEntries / totalEntries) * 100;
      win?.webContents.send('download-extra-message', { total: totalEntries, progress: processedEntries, fileName, completed: false, percentage: progress, message: `Extracting ${fileName}`, file: filePath });
      next();
    } else if (header.type === 'symlink') {
      fs.symlinkSync(header.linkname, filePath);
      processedEntries++;
      const progress = (processedEntries / totalEntries) * 100;
      win?.webContents.send('download-extra-message', { total: totalEntries, progress: processedEntries, fileName, completed: false, percentage: progress, message: `Extracting ${fileName}`, file: filePath });
      next();
    } else {
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      const writeStream = fs.createWriteStream(filePath);
      stream.pipe(writeStream);
      stream.on('end', () => {
        processedEntries++;
        const progress = (processedEntries / totalEntries) * 100;
        win?.webContents.send('download-extra-message', { total: totalEntries, progress: processedEntries, fileName, completed: false, percentage: progress, message: `Extracting ${fileName}`, file: filePath });
        next();
      });
      stream.resume();
    }
  });

  extract.on('finish', () => {
    fs.unlinkSync(tempFilePath);
    win?.webContents.send('download-extra-message', {total: totalEntries, progress: processedEntries, fileName: fileName, completed: true, percentage: 100, message: `Extracting ${fileName}`, file: null})
    if (fileName.startsWith("python")) {
      win?.webContents.send('download-extra-message', {total: totalEntries, progress: processedEntries, fileName: fileName, completed: false, percentage: 0, message: `Removing existing environment`, file: null})
      if (fs.existsSync(path.join(appFolder, "bin", translateOSPlatform(platform()), "python"))) {
        fs.rmSync(path.join(appFolder, "bin", translateOSPlatform(platform()), "python"), {recursive: true})
      }
      fs.mkdirSync(path.join(appFolder, "bin", translateOSPlatform(platform()), "python"), {recursive: true})
      win?.webContents.send('download-extra-message', {total: totalEntries, progress: processedEntries, fileName: fileName, completed: false, percentage: 0, message: `Moving new environment`, file: null})
      copyDirectoryContents(path.join(tempFolder, "resources", "bin", translateOSPlatform(platform()), "python"), path.join(appFolder, "bin", translateOSPlatform(platform()), "python")).then(
        () => {
          //fs.rmSync(path.join(tempFolder, "resources", "bin", translateOSPlatform(platform()), "python"), {recursive: true})
          win?.webContents.send('download-extra-message', {total: totalEntries, progress: processedEntries, fileName: fileName, completed: true, percentage: 100, message: `Finished`, file: null})
        }
      )
    } else if (fileName.startsWith("r-portable")) {
      win?.webContents.send('download-extra-message', {total: totalEntries, progress: processedEntries, fileName: fileName, completed: false, percentage: 0, message: `Removing existing environment`, file: null})
      if (fs.existsSync(path.join(appFolder, "bin", translateOSPlatform(platform()), "R-Portable"))){
        fs.rmSync(path.join(appFolder, "bin", translateOSPlatform(platform()), "R-Portable"), {recursive: true})
      }
      fs.mkdirSync(path.join(appFolder, "bin", translateOSPlatform(platform()), "R-Portable"), {recursive: true})
      win?.webContents.send('download-extra-message', {total: totalEntries, progress: processedEntries, fileName: fileName, completed: false, percentage: 0, message: `Moving new environment`, file: null})
      copyDirectoryContents(path.join(tempFolder, "resources", "bin", translateOSPlatform(platform()), "R-Portable"), path.join(appFolder, "bin", translateOSPlatform(platform()), "R-Portable")).then(
        () => {
          //fs.rmSync(path.join(tempFolder, "resources", "bin", translateOSPlatform(platform()), "R-Portable"), {recursive: true})
          win?.webContents.send('download-extra-message', {total: totalEntries, progress: processedEntries, fileName: fileName, completed: true, percentage: 100, message: `Finished`, file: null})
        }
      )
    }
    win?.webContents.send('download-extra-message', { total: totalEntries, progress: processedEntries, fileName, completed: true, percentage: 100, message: `Extracting ${fileName}`, file: null });
  });
}
