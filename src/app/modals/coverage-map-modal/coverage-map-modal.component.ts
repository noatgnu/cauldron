import { Component } from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ElectronService} from "../../core/services";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";

@Component({
  selector: 'app-coverage-map-modal',
  standalone: true,
  imports: [
    ImportedFileSelectionComponent,
    ReactiveFormsModule
  ],
  templateUrl: './coverage-map-modal.component.html',
  styleUrl: './coverage-map-modal.component.scss'
})
export class CoverageMapModalComponent {
  form = this.fb.group({
    fasta_file: new FormControl(null),
    file_path: new FormControl<string|null>(null, Validators.required),
    sequence_column: new FormControl<string|null>(null, Validators.required),
    index_column: new FormControl<string|null>(null, Validators.required),
    uniprot_acc_column: new FormControl<string|null>(null, Validators.required),
    value_columns: new FormControl([], Validators.required),
  })

  columns: string[] = []

  constructor(private fb: FormBuilder, private modal: NgbActiveModal, private electronService: ElectronService) { }

  openFile(fileType: string) {
    let extensions = ['tsv', 'txt']
    if (fileType === "fasta_file") {
      extensions = ['fasta', 'fa', 'faa']
    }

    this.electronService.remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {name: 'All Files', extensions: ['*']},
        {name: 'tabular file', extensions: extensions},
      ]
    }).then(result => {
      if (!result.canceled) {
        // @ts-ignore
        this.form.controls[fileType].setValue(result.filePaths[0])
        if (fileType === "file_path") {
          const line = this.electronService.getFirstLine(result.filePaths[0])
          if (line) {
            this.columns = line.split('\t')
          }
        }
      }
    })
  }

  updateFormWithSelected(e: string, formControl: string) {
    // @ts-ignore
    this.form.controls[formControl].setValue(e)
  }

  close() {
    this.modal.dismiss()
  }

  submit() {
    if (this.form.valid) {
      this.modal.close(this.form.value)
    }
  }

}
