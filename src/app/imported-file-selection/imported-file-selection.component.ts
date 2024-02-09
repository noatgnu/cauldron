import {Component, EventEmitter, Output} from '@angular/core';
import {ElectronService} from "../core/services";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-imported-file-selection',
  standalone: true,
  imports: [],
  templateUrl: './imported-file-selection.component.html',
  styleUrl: './imported-file-selection.component.scss'
})
export class ImportedFileSelectionComponent {

  files = this.electronService.files

  @Output() selected: EventEmitter<string> = new EventEmitter<string>()
  constructor(private electronService: ElectronService, private fb: FormBuilder) {

  }

  selectFile(file: Event) {
    const fileInput = file.target as HTMLSelectElement
    if (fileInput.value !== "") {
      this.selected.emit(fileInput.value)
    }
  }

}
