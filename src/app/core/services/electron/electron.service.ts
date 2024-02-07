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
import {Subject} from "rxjs";
import * as EmbeddedQueue from "embedded-queue"
import {Settings} from "../../../settings/settings";
import * as dataForgeFS from "data-forge-fs";
import {platform} from "os";
import {Options, PythonShell} from "python-shell";
import * as child_process from "child_process";
import {Job} from "embedded-queue";

import {JobConstructorData} from "embedded-queue/dist/job";
@Injectable({
  providedIn: 'root'
})
export class ElectronService {
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
  userDataPath: string = ""
  configPath: string = ""
  settings: Settings = new Settings()
  files: any[] = [];
  platform!: typeof platform;
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
  constructor() {
    // Conditional imports
    if (this.isElectron) {
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
        this.uniprotChannelSubject.next(message)
      });
      this.ipcRenderer.on('diann', (event, message) => {
        this.diannCVChannelSubject.next(message)
      })
      this.ipcRenderer.on('process-resource-path', (event, message) => {
        this.resourcePath = message
        this.scriptFolderPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), 'scripts')
        this.RPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin",this.translatedPlatform,  "R-Portable", "App", "R-Portable", "bin", "R.exe")
        this.RScriptPath = this.path.join(this.resourcePath.replace(this.path.sep + "app.asar", ""), "bin", this.translatedPlatform,  "R-Portable", "App", "R-Portable", "bin", "Rscript.exe")
      })
      this.ipcRenderer.on('close', (event, message) => {
        this.closeSubject.next(true)
      })
      this.ipcRenderer.on('data-transformation', (event, message) => {
        console.log(message)
        this.dataTransformationChannelSubject.next(message)
      })
      this.ipcRenderer.on('citation-utility', (event, message) => {
        this.citationUtilityChannelSubject.next(message)
      })
      this.ipcRenderer.on('dimensionality-reduction', (event, message) => {
        this.dimensionReductionChannelSubject.next(message)
      })
      this.ipcRenderer.on('curtain', (event, message) => {
        this.curtainChannelSubject.next(message)
      })
      this.ipcRenderer.on('differential-analysis', (event, message) => {
        this.differentialAnalysisSubject.next(message)
      })
      this.ipcRenderer.on('file', (event, message) => {
        this.fileSubject.next(message)
      })
      this.ipcRenderer.send('get-process-resource-path', 'python')
      this.ipcRenderer.on('python-path', (event, message) => {
        this.pythonPath = message
        this.pythonOptions.pythonPath = message
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
      this.ipcRenderer.send('get-python-path', 'python')

      this.userDataPath = this.remote.app.getPath('userData');
      this.loadConfigSettings()



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
  get isElectron(): boolean {
    return !!(window && window.process && window.process.type);
  }

  openDialog() {
    return this.dialog.showOpenDialog({properties: ['openFile', 'multiSelections']})
  }

  openFolderDialog() {
    return this.dialog.showOpenDialog({properties: ['openDirectory']})
  }

  async sniffFile(file: FileSystemEntry|File) {
    const reader = new this.txtReader();
    if (file instanceof File) {
      return reader.sniffLines(file, 10)
    }
    // @ts-ignore
    const fileObject = await new Promise((resolve, reject) => file.file(resolve, reject))
    // @ts-ignore
    return reader.sniffLines(fileObject, 10)
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

  *readTextFileLineByLine(filePath: string) {
    const fd = this.fs.openSync(filePath, 'r');
    const bfSize = 64 * 1024;
    const buf = new Buffer(bfSize);
    let leftOver = '';
    let lineNum = 0;
    let lines: string[] = [];
    let n;
    while ((n = this.fs.readSync(fd, buf, 0, bfSize, null)) !== 0) {
      lines = buf.toString('utf8', 0, n).split(/\r?\n/);
      lines[0] = leftOver + lines[0];
      // @ts-ignore
      leftOver = lines.pop();
      for (let i = 0; i < lines.length; ++i) {
        lineNum++;
        yield lines[i];
      }
    }
    this.fs.closeSync(fd)
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

  loadJobQueue() {
    const jobQueuePath = this.path.join(this.userDataPath, "jobQueue.json")
    if (this.fs.existsSync(jobQueuePath)) {
      const data = this.fs.readFileSync(jobQueuePath, 'utf8')
      return JSON.parse(data)
    } else {
      return {}
    }
  }

  getFirstLine(filePath: string) {
    const fd = this.fs.openSync(filePath, 'r');
    const bfSize = 64 * 1024;
    const buf = new Buffer(bfSize);
    let leftOver = '';
    let lineNum = 0;
    let lines: string[] = [];
    let n;
    while ((n = this.fs.readSync(fd, buf, 0, bfSize, null)) !== 0) {
      lines = buf.toString('utf8', 0, n).split(/\r?\n/);
      lines[0] = leftOver + lines[0];
      // @ts-ignore
      leftOver = lines.pop();
      for (let i = 0; i < lines.length; ++i) {
        lineNum++;
        this.fs.closeSync(fd)
        return lines[i];
      }
    }

  }

}
