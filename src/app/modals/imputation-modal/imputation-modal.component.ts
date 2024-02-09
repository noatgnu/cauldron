import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ElectronService} from "../../core/services";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";

@Component({
  selector: 'app-imputation-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ImportedFileSelectionComponent
  ],
  templateUrl: './imputation-modal.component.html',
  styleUrl: './imputation-modal.component.scss'
})
export class ImputationModalComponent {
  form: FormGroup = this.fb.group({
    file_path: new FormControl(null, Validators.required),
    method: new FormControl<string>('knn', Validators.required),
    k: new FormControl<number>(5, Validators.required),
    strategy: new FormControl<string>('mean', Validators.required),
    fillValue: new FormControl<number>(0, Validators.required),
    iterations: new FormControl<number>(10, Validators.required),
    columns: new FormControl<string[]>([], Validators.required),
  })
  columns: string[] = []
  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private electronService: ElectronService) {}

  close() {
    this.activeModal.dismiss()
  }

  submit() {
    this.activeModal.close(this.form.value)
  }

  openFile() {

    const file = this.electronService.remote.dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [
        {name: 'CSV', extensions: ['csv']},
        {name: 'TSV', extensions: ['tsv']},
        {name: 'TXT', extensions: ['txt']}
      ]
    })
    if (file) {
      this.form.controls['file_path'].setValue(file[0])
      const line = this.electronService.getFirstLine(file[0])
      if (line) {
        if (file[0].endsWith('.csv')) {
          this.columns = line.split(',')
        } else if (file[0].endsWith('.tsv') || file[0].endsWith('.txt')) {
          this.columns = line.split('\t')
        }
      }
    }
  }

  updateFormWithSelected(e: string, control: string) {
    this.form.controls[control].setValue(e)
  }
}
