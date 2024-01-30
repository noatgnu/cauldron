import {Component, EventEmitter, Output} from '@angular/core';
import {ElectronService} from "../../core/services";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";

@Component({
  selector: 'app-data-storage-settings',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './data-storage-settings.component.html',
  styleUrl: './data-storage-settings.component.scss'
})
export class DataStorageSettingsComponent {

  form = this.fb.group({
    resultStoragePath: new FormControl<string>('./', Validators.required)
  })

  @Output() changed: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor(private electronService: ElectronService, private fb: FormBuilder) {
    this.form.controls.resultStoragePath.setValue(this.electronService.settings.resultStoragePath)
  }
  handleClick(e: Event) {
    e.preventDefault()
    this.electronService.openFolderDialog().then((path) => {
      this.form.controls.resultStoragePath.setValue(path.filePaths[0])
    })

    this.form.valueChanges.subscribe((value) => {
      this.changed.emit(true)
      if (value.resultStoragePath) {
        this.electronService.settings.resultStoragePath = value.resultStoragePath
      }
      console.log(this.electronService.settings)
    })
  }
}
