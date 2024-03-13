import { Component } from '@angular/core';
import {NgClass} from "@angular/common";
import {DataStorageSettingsComponent} from "../data-storage-settings/data-storage-settings.component";
import {ElectronService} from "../../core/services";
import {PythonSettingsComponent} from "../python-settings/python-settings.component";
import {RSettingsComponent} from "../r-settings/r-settings.component";
import {CurtainSettingsComponent} from "../curtain-settings/curtain-settings.component";
import {ToastService} from "../../toast-container/toast.service";

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    NgClass,
    DataStorageSettingsComponent,
    PythonSettingsComponent,
    RSettingsComponent,
    CurtainSettingsComponent
  ],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss'
})
export class SettingsComponent {
  selectedOption = "Data Storage";

  changeStatus: { [key: string]: boolean } = {
    "Data Storage": false,
    "CURTAIN Backend": false,
    "Python": false,
    "R": false
  }

  constructor(private electronService: ElectronService, private toastService: ToastService) { }
  saveSettings() {
    this.electronService.saveConfigSettings()
    for (const key of Object.keys(this.changeStatus)) {
      this.changeStatus[key] = false
    }
    this.toastService.show("Settings", "Settings saved successfully").then()
  }
  revertSettings() {
    this.electronService.loadConfigSettings(this.electronService.configPath)
    this.toastService.show("Settings", "Settings reverted to previously saved version successfully").then()
  }
}
