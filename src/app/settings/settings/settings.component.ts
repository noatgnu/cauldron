import { Component } from '@angular/core';
import {NgClass} from "@angular/common";
import {DataStorageSettingsComponent} from "../data-storage-settings/data-storage-settings.component";
import {ElectronService} from "../../core/services";
import {PythonSettingsComponent} from "../python-settings/python-settings.component";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    NgClass,
    DataStorageSettingsComponent,
    PythonSettingsComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  selectedOption = "Data Storage";

  changeStatus: { [key: string]: boolean } = {
    "Data Storage": false,
    "CURTAIN Backend": false,
  }

  constructor(private electronService: ElectronService) { }
  saveSettings() {
    this.electronService.saveConfigSettings()
    for (const key of Object.keys(this.changeStatus)) {
      this.changeStatus[key] = false
    }
    console.log(this.electronService.settings)
  }
  revertSettings() {
    this.electronService.loadConfigSettings(this.electronService.configPath)
  }
}
