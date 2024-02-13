import { Component } from '@angular/core';
import {ElectronService} from "../../core/services";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";

@Component({
  selector: 'app-fuzzy-clustering-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ImportedFileSelectionComponent
  ],
  templateUrl: './fuzzy-clustering-modal.component.html',
  styleUrl: './fuzzy-clustering-modal.component.scss'
})
export class FuzzyClusteringModalComponent {
  form: FormGroup = this.fb.group({
    file_path: new FormControl(null, Validators.required),
    annotation_path: new FormControl(null, Validators.required),
    center_count: new FormControl([3], Validators.required),
  })

  constructor(private fb: FormBuilder, private electronService: ElectronService, private activeModal: NgbActiveModal) {

  }

  close() {
    this.activeModal.dismiss()
  }

  submit() {
    if (this.form.valid) {
      this.activeModal.close(this.form.value)
    }
  }

  loadExample() {
    const file_path = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep +'app.asar', ''), 'examples', 'diann', 'imputed.data.txt'
    )

    const annotation_path = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep +'app.asar', ''), 'examples', 'diann', 'annotation.txt'
    )

    this.form.patchValue({file_path, annotation_path, center_count: [3,4]})
  }

  openFile(file_type: string) {
    this.electronService.remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{name: 'Tabulated text file', extensions: ['txt', 'csv', 'tsv']}]
    }).then((result) => {
      if (!result.canceled) {
        this.form.patchValue({[file_type]: result.filePaths[0]})
      }
    })
  }

  updateFormWithSelected(event: any, file_type: string) {
    this.form.patchValue({[file_type]: event.file_path})
  }
}
