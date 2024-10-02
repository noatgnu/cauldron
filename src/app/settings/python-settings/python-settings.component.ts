import {Component, EventEmitter, NgZone, Output} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {ElectronService} from "../../core/services";
import {NgbProgressbar} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-python-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SharedModule,
    NgbProgressbar
  ],
  templateUrl: './python-settings.component.html',
  styleUrl: './python-settings.component.scss'
})
export class PythonSettingsComponent {
  form = this.fb.group({
    python_path: new FormControl<string>(this.electronService.pythonPath),
    useSystemP: new FormControl<boolean>(this.electronService.settings.useSystemPython),
  })
  processing: boolean = false
  pipList: {name: string, version: string}[] = []
  installProcess: string = ''
  @Output() changed: EventEmitter<boolean> = new EventEmitter<boolean>()
  constructor(private fb: FormBuilder, public electronService: ElectronService, private zone: NgZone) {
    if (this.electronService.pythonPath) {
      this.form.controls['python_path'].setValue(this.electronService.pythonPath)
      this.getPipList()
      this.electronService.ipcRenderer.on('install-python-packages-progress', (event, arg) => {
        this.zone.run(() => {
          this.installProcess += arg
        })
        if (arg.startsWith('Installation exited with code')) {
          this.getPipList()
        }
      })
    }
    if (this.electronService.settings.useSystemPython) {
      this.form.controls['python_path'].setValue(this.electronService.settings.pythonPath)
    }
    this.form.valueChanges.subscribe(() => {
      this.changed.emit(true)
      if (this.form.controls['useSystemP'].value === true) {
        this.electronService.settings.useSystemPython = true
        if (this.form.value.python_path) {
          this.electronService.pythonPath = this.form.value.python_path
        }
      } else {
        this.electronService.settings.useSystemPython = false
        this.electronService.pythonPath = this.electronService.defaultPythonPath.slice()
        this.form.controls['python_path'].setValue(this.electronService.pythonPath)
      }
    })

  }

  getPipList() {
    this.processing = true
    this.electronService.child_process.exec(`"${this.electronService.pythonPath}" -m pip list`, (err, stdout, stderr) => {
      //parse pip list output
      console.log(stdout)
      this.zone.run(() => {
        const lines = stdout.split(/\n/).slice(2)
        for (const line of lines) {
          const [name, version] = line.split(/\s+/)
          if (name !== "" && name !== "pip") {
            this.pipList.push({name, version})
          }
        }
        this.processing = false
      })
    })
  }

  installRequirements() {
    console.log(`${this.electronService.resourcePath + this.electronService.path.sep + 'requirements.txt'}`)
    this.processing = true
    this.electronService.ipcRenderer.send('install-python-packages', `${this.electronService.resourcePath + this.electronService.path.sep + 'requirements.txt'}`)
  }

  saveSettings() {
    this.changed.emit(true)

  }
}
