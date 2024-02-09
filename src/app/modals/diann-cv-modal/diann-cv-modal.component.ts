import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ElectronService} from "../../core/services";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";

@Component({
  selector: 'app-diann-cv-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ImportedFileSelectionComponent
  ],
  templateUrl: './diann-cv-modal.component.html',
  styleUrl: './diann-cv-modal.component.scss'
})
export class DiannCvModalComponent {
  form: FormGroup = this.fb.group({
    pr_matrix_file: new FormControl(null),
    pg_matrix_file: new FormControl(null),
    log_file: new FormControl(null),
    sample_annotations: new FormControl(null),
    annotation_file: new FormControl(null),
    samples: new FormControl(null),
  })
  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private electronService: ElectronService) {
  }

  close() {
    this.activeModal.dismiss()
  }

  submit() {
    this.activeModal.close(this.form.value)
  }

  browse(fileType: string) {
    this.electronService.remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {name: 'All Files', extensions: ['*']},
        {name: 'text file', extensions: ['tsv', 'txt']},
      ]
    }).then(result => {
      if (!result.canceled) {
        this.form.controls[fileType].setValue(result.filePaths[0])
      }
    })
  }

  loadExample() {
    const diannFolder = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep + "app.asar", ""),
      'examples',
      'diann'
    )
    this.form.controls['pr_matrix_file'].setValue(this.electronService.path.join(diannFolder, 'Reports.pr_matrix.tsv'))
    this.form.controls['pg_matrix_file'].setValue(this.electronService.path.join(diannFolder, 'Reports.pg_matrix.tsv'))
    this.form.controls['log_file'].setValue(this.electronService.path.join(diannFolder, 'Reports.log.txt'))
    this.form.controls['annotation_file'].setValue(this.electronService.path.join(diannFolder, 'annotation.txt'))
  }

  updateFormWithSelected(e: string, control: string) {
    this.form.controls[control].setValue(e)
  }
}
