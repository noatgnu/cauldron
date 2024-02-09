import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ElectronService} from "../../core/services";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";

@Component({
  selector: 'app-diann-to-curtainptm-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ImportedFileSelectionComponent
  ],
  templateUrl: './diann-to-curtainptm-modal.component.html',
  styleUrl: './diann-to-curtainptm-modal.component.scss'
})
export class DiannToCurtainptmModalComponent {

  form: FormGroup = this.fb.group({
    pr_file_path: new FormControl(null, Validators.required),
    report_file_path: new FormControl(null, Validators.required),
    modification_of_interests: new FormControl("UniMod:21", Validators.required),
  })
  columns: string[] = []

  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private electronService: ElectronService) {
  }

  close() {
    this.activeModal.dismiss()
  }

  submit() {
    console.log(this.form.valid)
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

  loadExample() {
    const diannFolder = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep + "app.asar", ""),
      'examples',
      'diann_to_curtainptm'
    )
    this.form.controls['pr_file_path'].setValue(this.electronService.path.join(diannFolder, 'Reports.pr_matrix.tsv'))
    this.form.controls['report_file_path'].setValue(this.electronService.path.join(diannFolder, 'Reports.tsv'))
  }

  updateFormWithSelected(e: string, control: string) {
    this.form.controls[control].setValue(e)
  }
}
