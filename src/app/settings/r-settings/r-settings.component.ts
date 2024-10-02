import {Component, EventEmitter, NgZone, Output} from '@angular/core';
import {NgbProgressbar} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {ElectronService} from "../../core/services";

@Component({
  selector: 'app-r-settings',
  standalone: true,
  imports: [
    NgbProgressbar,
    ReactiveFormsModule
  ],
  templateUrl: './r-settings.component.html',
  styleUrl: './r-settings.component.scss'
})
export class RSettingsComponent {

  form: FormGroup = this.fb.group({
    r_path: new FormControl(null),
    useSystemR: new FormControl(false)
  })

  packagesList: {name: string, version: string}[] = []
  processing: boolean = false
  @Output() changed: EventEmitter<boolean> = new EventEmitter<boolean>()
  constructor(private fb: FormBuilder, private electronService: ElectronService, private zone: NgZone) {
    if (this.electronService.RPath) {
      this.form.controls['r_path'].setValue(this.electronService.RPath)
      this.getPackageList()
    }
    this.form.controls['useSystemR'].setValue(this.electronService.settings.useSystemR)
    if (this.electronService.settings.useSystemR) {
      this.form.controls['r_path'].setValue(this.electronService.settings.RPath)
    }
    this.form.valueChanges.subscribe(() => {
      this.changed.emit(true)
      if (this.form.controls['useSystemR'].value === true) {
        this.electronService.settings.useSystemR= true
        if (this.form.controls['r_path'].value) {
          this.electronService.RPath = this.form.controls['r_path'].value
          this.electronService.settings.RPath = this.form.controls['r_path'].value
        }
      } else {
        this.electronService.settings.useSystemR = false
        this.electronService.RPath = this.electronService.defaultRPath.slice()
        this.electronService.RScriptPath = this.electronService.defaultRScriptPath.slice()
        this.form.controls['r_path'].setValue(this.electronService.RPath)
      }
    })
  }

  getPackageList() {
    this.processing = true
    this.electronService.child_process.exec(`"${this.electronService.RScriptPath}" -e "installed.packages()[, c('Package','Version')]"`, (err, stdout, stderr) => {
      console.log(err)
      console.log(stdout)
      this.zone.run(() => {
        const lines = stdout.split(/\n/).slice(2)
        for (const line of lines) {
          const [name, rPackage, version] = line.split(/\s+/)
          if (name !== "") {
            this.packagesList.push({name, version})
          }
        }
        this.processing = false
      })
    })
  }

  saveSettings() {

  }
}
