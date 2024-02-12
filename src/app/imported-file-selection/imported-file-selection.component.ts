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
  @Output() columns: EventEmitter<string[]> = new EventEmitter<string[]>()
  constructor(private electronService: ElectronService, private fb: FormBuilder) {

  }

  selectFile(file: Event) {
    const fileInput = file.target as HTMLSelectElement
    if (fileInput.value !== "") {
      this.selected.emit(fileInput.value)
      const line = this.electronService.getFirstLine(fileInput.value)
      if (line) {
        if (fileInput.value.endsWith('.csv')) {
          this.columns.emit(line.split(','))
        } else {
          this.columns.emit(line.split('\t'))
        }
      }
    }
  }

}
