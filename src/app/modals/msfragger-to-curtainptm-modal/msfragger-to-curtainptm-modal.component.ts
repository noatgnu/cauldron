import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ElectronService} from "../../core/services";
import {SharedModule} from "../../shared/shared.module";

@Component({
  selector: 'app-msfragger-to-curtainptm-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './msfragger-to-curtainptm-modal.component.html',
  styleUrl: './msfragger-to-curtainptm-modal.component.scss'
})
export class MsfraggerToCurtainptmModalComponent {
  form: FormGroup = this.fb.group({
    file_path: new FormControl(null, Validators.required),
    index_col: new FormControl(null, Validators.required),
    peptide_col: new FormControl(null, Validators.required),
    fasta_file: new FormControl(""),
  })
  columns: string[] = []

  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private electronService: ElectronService) {
  }

  close() {
    this.activeModal.dismiss()
  }

  submit() {
    if (this.form.valid) {
      this.activeModal.close(this.form.value)
    }
  }

  openFile(form_path: string) {
    this.electronService.remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {name: 'text file', extensions: ['tsv', 'txt']},
      ]
    }).then(result => {
      if (!result.canceled) {
        this.form.controls[form_path].setValue(result.filePaths[0])
        const line = this.electronService.getFirstLine(result.filePaths[0])
        if (line) {
          this.columns = line.split('\t')
        }
      }
    })
  }
}
