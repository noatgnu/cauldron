import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {ElectronService} from "../../core/services";
import {NgTemplateOutlet} from "@angular/common";

@Component({
  selector: 'app-normalization-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgTemplateOutlet
  ],
  templateUrl: './normalization-modal.component.html',
  styleUrl: './normalization-modal.component.scss'
})
export class NormalizationModalComponent {
  form = this.fb.group({
    file_path: new FormControl<string>("", Validators.required),
    columns_name: new FormControl<string[]>([], Validators.required),
    scaler_type: new FormControl<string>("robust", Validators.required),
    with_centering: new FormControl<boolean>(true, Validators.required),
    with_scaling: new FormControl<boolean>(true, Validators.required),
    n_quantiles: new FormControl<number>(1000, Validators.required),
    output_distribution: new FormControl<string>("uniform", Validators.required),
    norm: new FormControl<string>("l2", Validators.required),
    power_method: new FormControl<string>("yeo-johnson", Validators.required),
  })
  columns: string[] = []
  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private electronService: ElectronService) {
  }

  close() {
    this.activeModal.dismiss()
  }

  submit() {
    this.activeModal.close(this.form.value)
  }

  openFile() {
    const result = this.electronService.remote.dialog.showOpenDialogSync({
      properties: ['openFile'],
      filters: [
        {name: 'Tabular text files', extensions: ['csv', 'txt', 'tsv']},
      ]
    })
    if (result) {
      this.form.controls['file_path'].setValue(result[0])
      const line = this.electronService.getFirstLine(result[0])
      if (line) {
        if (result[0].endsWith('.csv')) {
          this.columns = line.split(',')
        } else {
          this.columns = line.split('\t')
        }
      }
    }

  }
}
