import {Component, NgZone} from '@angular/core';
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
  })

  packagesList: {name: string, version: string}[] = []
  processing: boolean = false
  constructor(private fb: FormBuilder, private electronService: ElectronService, private zone: NgZone) {
    if (this.electronService.RPath) {
      this.form.controls['r_path'].setValue(this.electronService.RPath)
      this.getPackageList()
    }
  }

  getPackageList() {
    this.processing = true
    console.log(this.electronService.RScriptPath)

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
}
