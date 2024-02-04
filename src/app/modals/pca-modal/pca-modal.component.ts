import {Component, NgZone} from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ElectronService} from "../../core/services";

@Component({
  selector: 'app-pca-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './pca-modal.component.html',
  styleUrl: './pca-modal.component.scss'
})
export class PcaModalComponent {
  form = this.fb.group({
    input_file: new FormControl<string>('', Validators.required),
    columns_name: new FormControl<string[]>([], Validators.required),
    n_components: new FormControl<number>(2, [Validators.min(2), Validators.max(3), Validators.required]),
    log2: new FormControl<boolean>(false),
  })

  columns: string[] = []
  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private electronService: ElectronService, private zone: NgZone) {
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
      this.form.controls['input_file'].setValue(result[0])
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

  loadExample() {
    const file_path = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep +'app.asar', ''), 'examples', 'diann', 'imputed.data.txt'
    )
    this.form.controls['input_file'].setValue(file_path)
    const line = this.electronService.getFirstLine(file_path)
    if (line) {
      if (file_path.endsWith('.csv')) {
        this.columns = line.split(',')
      } else {
        this.columns = line.split('\t')
      }
    }
    this.electronService.dataForgeFS.readFile(this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep +'app.asar', ''), 'examples', 'phate', 'phate_output.txt'
    )).parseCSV().then((df) => {
      this.form.controls.columns_name.setValue(df.getSeries("sample").toArray())
    })
    this.form.controls['n_components'].setValue(2)
    this.form.controls['log2'].setValue(true)
  }
}
