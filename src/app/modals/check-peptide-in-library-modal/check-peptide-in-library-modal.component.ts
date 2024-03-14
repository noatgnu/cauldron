import { Component } from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ElectronService} from "../../core/services";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";

@Component({
  selector: 'app-check-peptide-in-library-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ImportedFileSelectionComponent
  ],
  templateUrl: './check-peptide-in-library-modal.component.html',
  styleUrl: './check-peptide-in-library-modal.component.scss'
})
export class CheckPeptideInLibraryModalComponent {

  form = this.fb.group({
    fasta_file: new FormControl(null, Validators.required),
    miss_cleavage: new FormControl(2, Validators.required),
    min_length: new FormControl(5, Validators.required),
    file_path: new FormControl(null, Validators.required),
    peptide_column: new FormControl(null, Validators.required),
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
