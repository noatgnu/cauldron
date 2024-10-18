import { Injectable } from '@angular/core';

// If you import a module but never use any of the imported values other than as TypeScript types,
// the resulting javascript file will look as if you never imported the module at all.
import { ipcRenderer, webFrame, dialog } from 'electron';
import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as remote from '@electron/remote';
import {glob} from "glob";
import {TxtReader} from "txt-reader";
import * as path from "path";
import {BehaviorSubject, Subject} from "rxjs";
import * as EmbeddedQueue from "embedded-queue"
import {Settings} from "../../../settings/settings";
import * as dataForgeFS from "data-forge-fs";
import {platform, arch} from "os";
import {Options, PythonShell} from "python-shell";
import * as child_process from "child_process";
import {Job} from "embedded-queue";
import axios from "axios";
import * as https from "https";
import * as tar from "tar";
@Injectable({
  providedIn: 'root'
})
export class ElectronService {
  tar!: typeof tar;
  https!: typeof https;
  ipcRenderer!: typeof ipcRenderer;
  webFrame!: typeof webFrame;
  childProcess!: typeof childProcess;
  fs!: typeof fs;
  dialog!: typeof dialog;
  txtReader!: typeof TxtReader;
  glob!: typeof glob;
  path!: typeof path;
  embeddedQueue!: typeof EmbeddedQueue;
  remote!: typeof remote;
  dataForgeFS!: typeof dataForgeFS;
  uniprotChannelSubject: Subject<string> = new Subject<string>()
  diannCVChannelSubject: Subject<string> = new Subject<string>()
  dataTransformationChannelSubject: Subject<string> = new Subject<string>()
  citationUtilityChannelSubject: Subject<string> = new Subject<string>()
  dimensionReductionChannelSubject: Subject<string> = new Subject<string>()
  curtainChannelSubject: Subject<string> = new Subject<string>()
  differentialAnalysisSubject: Subject<string> = new Subject<string>()
  fileSubject: Subject<string> = new Subject<string>()
  shutdownSubject: Subject<string> = new Subject<string>()
  statsTestSubject: Subject<string> = new Subject<string>()
  userDataPath: string = ""
  configPath: string = ""
  settings: Settings = new Settings()
  files: any[] = [];
  platform!: typeof platform;
  arch!: typeof arch;
  pythonPath: string = ""
  pythonShell!: typeof PythonShell;
  closeSubject: Subject<boolean> = new Subject<boolean>()
  pythonOptions: Options = {
    mode: 'text',
    pythonPath: '',
    pythonOptions: ['-u'], // get print results in real-time
    //scriptPath: 'path/to/my/scripts',
    //args: ['value1', 'value2', 'value3']
  };
  RPath: string = ""
  RScriptPath: string = ""
  scriptFolderPath: string = ""
  child_process!: typeof child_process;
  resourcePath: string = ""
  translatedPlatform: string = ""
  utilitySubject: Subject<string> = new Subject<string>()
  defaultRPath: string = ""
  defaultRScriptPath: string = ""
  defaultPythonPath: string = ""

  linkDataSubject: BehaviorSubject<{step: number, folder: number, token: string, baseURL: string, name: string, session: string}> = new BehaviorSubject<{step: number, folder: number, token: string, baseURL: string, name: string, session: string}>({step: 0, folder: 0, token: "", baseURL: "", name: "", session: ""})
  appVersion: string = ""
  downloadExtraMessageSubject: Subject<{total: number, progress: number, fileName: string, completed: boolean, percentage: number, message: string, file: string|null}> = new Subject()

  constructor() {
    // Conditional imports
    if (this.isElectron) {
      this.tar = (window as any).require('tar');
      this.https = (window as any).require('https');
      this.ipcRenderer = (window as any).require('electron').ipcRenderer;
      this.webFrame = (window as any).require('electron').webFrame;
      this.dialog = (window as any).require('@electron/remote').dialog;
      this.fs = (window as any).require('fs');
      this.glob = (window as any).require('glob');
      this.txtReader = (window as any).require('txt-reader').TxtReader;
      this.childProcess = (window as any).require('child_process');
      this.path = (window as any).require('path');
      this.embeddedQueue = (window as any).require('embedded-queue');
      this.remote = (window as any).require('@electron/remote');
      this.dataForgeFS = (window as any).require('data-forge-fs');
      this.platform = (window as any).require('os').platform;
      this.child_process = (window as any).require('child_process');
      this.pythonShell = (window as any).require('python-shell').PythonShell;
      this.translatedPlatform = this.translatePlatform(this.platform())
      this.arch = (window as any).require('os').arch;
      this.childProcess.exec('node -v', (error, stdout, stderr) => {
        if (error) {
          console.error(`error: ${error.message}`);
          return;
        }
        if (stderr) {
          console.error(`stderr: ${stderr}`);
          return;
        }
        console.log(`stdout:\n${stdout}`);
      });
      this.ipcRenderer.on('uniprot', (event, message) => {
        this.uniprotChannelSubject.next(message as string)
      });
      this.ipcRenderer.on('diann', (event, message) => {
        this.diannCVChannelSubject.next(message as string)
      })
      this.ipcRenderer.on('process-resource-path', (event, message) => {
        this.resourcePath = message
        this.scriptFolderPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), 'scripts')
        if (this.platform() === 'darwin') {
          if (this.arch() === 'arm64') {
            this.defaultRPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "bin", "R")
            this.defaultRScriptPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "bin", "Rscript")
            this.defaultPythonPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "python", "bin", "python")
          } else {
            this.defaultRPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "bin", "R")
            this.defaultRScriptPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "bin", "Rscript")
            this.defaultPythonPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "python", "bin", "python")
          }
          if (this.settings.useSystemR && this.settings.RPath && this.settings.RPath !== "") {
            this.RPath = this.settings.RPath
            this.RScriptPath = this.RPath.replace(this.path.sep+"bin"+this.path.sep+"R", this.path.sep+"bin"+this.path.sep+"Rscript")
          } else {
            this.RPath = this.defaultRPath
            this.RScriptPath = this.defaultRScriptPath
          }
          if (this.settings.useSystemPython && this.settings.pythonPath && this.settings.pythonPath !== "") {
            this.pythonPath = this.settings.pythonPath
            this.pythonOptions.pythonPath = this.pythonPath.slice()
          } else {
            this.pythonPath = this.defaultPythonPath
            this.pythonOptions.pythonPath = this.pythonPath.slice()
          }
        } else if (this.platform() === 'win32') {
          this.defaultRPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin",this.translatedPlatform,  "R-Portable", "App", "R-Portable", "bin", "R.exe")
          this.defaultRScriptPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "App", "R-Portable", "bin", "Rscript.exe")
          this.defaultPythonPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "python", "python.exe")
          if (!fs.existsSync(this.defaultRPath)) {
            this.defaultRPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "bin", "R.exe")
            this.defaultRScriptPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "bin", "Rscript.exe")
          }
          if (this.settings.useSystemR && this.settings.RPath && this.settings.RPath !== "") {
            this.RPath = this.settings.RPath
            this.RScriptPath = this.RPath.replace(this.path.sep+"bin"+this.path.sep+"R", this.path.sep+"bin"+this.path.sep+"Rscript")
          } else {
            this.RPath = this.defaultRPath
            this.RScriptPath = this.defaultRScriptPath
          }
          if (this.settings.useSystemPython && this.settings.pythonPath && this.settings.pythonPath !== "") {
            this.pythonPath = this.settings.pythonPath
            this.pythonOptions.pythonPath = this.pythonPath.slice()
          } else {
            this.pythonPath = this.defaultPythonPath
            this.pythonOptions.pythonPath = this.pythonPath.slice()
          }
        } else if (this.platform() === 'linux') {
          this.defaultRPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "bin", "R")
          this.defaultRScriptPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "bin", "Rscript")
          this.defaultPythonPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "python", "bin", "python")
          if (this.settings.useSystemR && this.settings.RPath && this.settings.RPath !== "") {
            this.RPath = this.settings.RPath
            this.RScriptPath = this.RPath.replace(this.path.sep+"bin"+this.path.sep+"R", this.path.sep+"bin"+this.path.sep+"Rscript")
          } else {
            this.RPath = this.defaultRPath
            this.RScriptPath = this.defaultRScriptPath
          }

          if (this.settings.useSystemPython && this.settings.pythonPath && this.settings.pythonPath !== "") {
            this.pythonPath = this.settings.pythonPath
            this.pythonOptions.pythonPath = this.pythonPath.slice()
          } else {
            this.pythonPath = this.defaultPythonPath
            this.pythonOptions.pythonPath = this.pythonPath.slice()
          }
        }
      })
      this.ipcRenderer.on('close', () => {
        this.closeSubject.next(true)
      })
      this.ipcRenderer.on('data-transformation', (event, message) => {
        console.log(message)
        this.dataTransformationChannelSubject.next(message as string)
      })
      this.ipcRenderer.on('citation-utility', (event, message) => {
        this.citationUtilityChannelSubject.next(message as string)
      })
      this.ipcRenderer.on('dimensionality-reduction', (event, message) => {
        this.dimensionReductionChannelSubject.next(message as string)
      })
      this.ipcRenderer.on('curtain', (event, message) => {
        this.curtainChannelSubject.next(message as string)
      })
      this.ipcRenderer.on('differential-analysis', (event, message) => {
        this.differentialAnalysisSubject.next(message as string)
      })
      this.ipcRenderer.on('file', (event, message) => {
        this.fileSubject.next(message as string)
      })
      this.ipcRenderer.on('statistical-tests', (event, message) => {
        this.statsTestSubject.next(message as string)
      })
      this.ipcRenderer.on('utilities', (event, message) => {
        this.utilitySubject.next(message as string)
      })
      this.ipcRenderer.on('shutdown', (event, message) => {
        this.shutdownSubject.next(message as string)
      })
      this.ipcRenderer.on('download-extra-message', (event, message) => {
        this.downloadExtraMessageSubject.next(message as {total: number, progress: number, fileName: string, completed: boolean, percentage: number, message: string, file: string|null})
      })


      this.ipcRenderer.on('link-data', (event, message) => {
        const data: string = message.replace("cauldron:", "")
        console.log(message)
        try {
          this.linkDataSubject.next(JSON.parse(atob(data)) as { step: number, folder: number, token: string, baseURL: string, name: string, session: string })
        } catch (e) {
          console.log(e)
        }
      })
      this.ipcRenderer.on('app-version', (event, message) => {
        this.appVersion = message
      })
      this.ipcRenderer.send('get-app-version', 'version')
      this.ipcRenderer.send('get-link-data', 'link')
      this.ipcRenderer.send('get-process-resource-path', 'python')
      /*this.ipcRenderer.on('python-path', (event, message) => {
        this.defaultPythonPath = message
        if (this.settings.useSystemPython && this.settings.pythonPath && this.settings.pythonPath !== "") {
          this.pythonPath = this.settings.pythonPath
        } else {
          this.pythonPath = message
        }
        this.pythonOptions.pythonPath = this.pythonPath.slice()
        console.log(message)
        console.log(this.pythonOptions)
        this.pythonShell.runString("import sys;print(sys.version)", this.pythonOptions).then(
          (message) => {
            console.log(message)
          }
        ).catch(
          (err) => {
            console.log(err)
          }
        )
      })
      this.ipcRenderer.send('get-python-path', 'python')*/

      this.userDataPath = this.remote.app.getPath('userData');
      this.loadConfigSettings()
      if (this.RPath === "" && this.settings.useSystemR && this.settings.RPath && this.settings.RPath !== "") {
        this.RPath = this.settings.RPath.slice()
        this.RScriptPath = this.settings.RPath.replace(this.path.sep+"bin"+this.path.sep+"R", this.path.sep+"bin"+this.path.sep+"Rscript")
      }
      if (this.pythonPath === "" && this.settings.useSystemPython && this.settings.pythonPath && this.settings.pythonPath !== "") {
        this.pythonPath = this.settings.pythonPath.slice()
        this.pythonOptions.pythonPath = this.pythonPath.slice()
      }

      // Notes :
      // * A NodeJS's dependency imported with 'window.require' MUST BE present in `dependencies` of both `app/package.json`
      // and `package.json (root folder)` in order to make it work here in Electron's Renderer process (src folder)
      // because it will loaded at runtime by Electron.
      // * A NodeJS's dependency imported with TS module import (ex: import { Dropbox } from 'dropbox') CAN only be present
      // in `dependencies` of `package.json (root folder)` because it is loaded during build phase and does not need to be
      // in the final bundle. Reminder : only if not used in Electron's Main process (app folder)

      // If you want to use a NodeJS 3rd party deps in Renderer process,
      // ipcRenderer.invoke can serve many common use cases.
      // https://www.electronjs.org/docs/latest/api/ipc-renderer#ipcrendererinvokechannel-args
    }
  }

  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  translatePlatform(platform: string) {
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

  openDialog() {
    return this.dialog.showOpenDialog({properties: ['openFile', 'multiSelections']})
  }

  openFolderDialog() {
    return this.dialog.showOpenDialog({properties: ['openDirectory']})
  }

  async sniffFile(file: FileSystemEntry | File): Promise<{result: (string|Uint8Array)[]}> {
    const reader = new this.txtReader();

    if (file instanceof File) {
      return reader.sniffLines(file, 10);
    }

    const fileObject = await new Promise<File>((resolve, reject) => {
      (file as FileSystemFileEntry).file(resolve, reject);
    });

    return reader.sniffLines(fileObject, 10);
  }

  loadConfigSettings(configPath: string = "") {
    if (configPath !== "") {
      this.configPath = configPath
    } else {
      this.configPath = this.path.join(this.userDataPath, "config.json")
    }
    console.log(this.configPath)
    if (this.fs.existsSync(this.configPath)) {
      const data = this.fs.readFileSync(this.configPath, 'utf8')
      this.settings.fromJSON(data)
      console.log(this.settings)
      return this.settings
    } else {
      this.settings = new Settings()
      return this.settings
    }
  }

  saveConfigSettings() {
    this.fs.writeFileSync(this.configPath, this.settings.toJSON())
  }

  *readTextFileLineByLine(filePath: string): Generator<string, void, unknown> {
    const fd = this.fs.openSync(filePath, 'r');
    const bfSize = 64 * 1024;
    const buf = Buffer.alloc(bfSize);
    let leftOver = '';
    let lines: string[] = [];
    let n: number;

    try {
      while ((n = this.fs.readSync(fd, buf, 0, bfSize, null)) !== 0) {
        lines = buf.toString('utf8', 0, n).split(/\r?\n/);
        lines[0] = leftOver + lines[0];
        leftOver = lines.pop() || '';
        for (const line of lines) {
          yield line;
        }
      }
      if (leftOver) {
        yield leftOver;
      }
    } finally {
      this.fs.closeSync(fd);
    }
  }

  saveJobQueue(jobMap: {[key: string]: {completed: boolean, job: Job, error: boolean, type: string, name?: string}}) {
    const jobQueuePath = this.path.join(this.userDataPath, "jobQueue.json")
    const payload: {[key: string]: {completed: boolean, job: any, error: boolean, type: string, name?: string}} = this.loadJobQueue()
    for (const key of Object.keys(jobMap)) {
      const job: any = {
        createdAt: jobMap[key].job.createdAt,
        id: jobMap[key].job.id,
        logs: jobMap[key].job.logs,
        saved: false,
        type: jobMap[key].job.type,
        updatedAt: jobMap[key].job.updatedAt,
        completedAt: jobMap[key].job.completedAt,
        startedAt: jobMap[key].job.startedAt,
        failedAt: jobMap[key].job.failedAt,
        duration: jobMap[key].job.duration,
      }
      payload[key] = { completed: jobMap[key].completed, job: job, error: jobMap[key].error, type: jobMap[key].type, name: jobMap[key].name}
    }
    console.log(payload)
    this.fs.writeFileSync(jobQueuePath, JSON.stringify(payload))
  }

  loadJobQueue(): { [key: string]: { completed: boolean; job: any; error: boolean; type: string; name?: string } } {
    const jobQueuePath = this.path.join(this.userDataPath, "jobQueue.json");
    if (this.fs.existsSync(jobQueuePath)) {
      const data = this.fs.readFileSync(jobQueuePath, 'utf8');
      return JSON.parse(data) as { [key: string]: { completed: boolean; job: any; error: boolean; type: string; name?: string } };
    } else {
      return {};
    }
  }

  getFirstLine(filePath: string): string | null {
    const fd = this.fs.openSync(filePath, 'r');
    const bfSize = 64 * 1024;
    const buf = Buffer.alloc(bfSize);
    let leftOver = '';
    let lines: string[] = [];
    let n: number;

    try {
      while ((n = this.fs.readSync(fd, buf, 0, bfSize, null)) !== 0) {
        lines = buf.toString('utf8', 0, n).split(/\r?\n/);
        lines[0] = leftOver + lines[0];
        leftOver = lines.pop() || '';
        if (lines.length > 0) {
          return lines[0];
        }
      }
    } catch (error: any) {
      console.error(`Error reading file: ${error.message}`);
      return null;
    } finally {
      this.fs.closeSync(fd);
    }

    return null;
  }

  async downloadAndSaveExtra(url: string, fileName: string) {
    this.ipcRenderer.send('download-extra', {url: url, fileName: fileName, tempFolder: this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "temp"), appFolder: this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""))})
  }

  async getDownloadURL(platform: string, arch: string, version: string, environment: string) {
    console.log(platform, arch, version, environment)
    const url = `https://api.github.com/repos/noatgnu/cauldron/releases`
    const response = await axios({
      method: "get",
      url: url,
      headers: {
        'accept': 'application/json',
      }
    })
    const data: any[] = response.data
    for (const d of data) {
      if (d["tag_name"] === version) {
        for (const a of d["assets"]) {
          if (platform === "win") {
            if (a["name"].includes(platform) && a["name"].includes(environment) && !a["name"].includes("darwin")) {
              console.log(a.url)
              return a.url
            }
          }
          if (a["name"].includes(platform) && a["name"].includes(arch) && a["name"].includes(environment)) {
            return a.url
          }
        }
      }
    }
  }


}
