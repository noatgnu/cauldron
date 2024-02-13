import {Component, EventEmitter, Output} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {ElectronService} from "../../core/services";

@Component({
  selector: 'app-curtain-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './curtain-settings.component.html',
  styleUrl: './curtain-settings.component.scss'
})
export class CurtainSettingsComponent {
  form = this.fb.group({
    curtainBackendUrl: new FormControl<string>(""),
    APIKey: new FormControl<string>(""),
    privateKey: new FormControl<string>(""),
    publicKey: new FormControl<string>(""),
  })

  @Output() changed: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(private fb: FormBuilder, private electronService: ElectronService) {
    this.form.controls.curtainBackendUrl.setValue(this.electronService.settings.curtainBackendUrl)
    this.form.controls.APIKey.setValue(this.electronService.settings.APIKey)
    this.form.controls.privateKey.setValue(this.electronService.settings.privateKey)
    this.form.controls.publicKey.setValue(this.electronService.settings.publicKey)
    this.form.controls.curtainBackendUrl.valueChanges.subscribe((value) => {
      if (value) {
        this.electronService.settings.curtainBackendUrl = value
        this.changed.emit(true)
      }
    })
    this.form.controls.APIKey.valueChanges.subscribe((value) => {
      if (value) {
        this.electronService.settings.APIKey = value
        this.changed.emit(true)
      }
    })
  }

}
