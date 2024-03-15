import { Component } from '@angular/core';
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ElectronService} from "../../core/services";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";
import {SharedModule} from "../../shared/shared.module";

@Component({
  selector: 'app-remap-ptm-positions-modal',
  standalone: true,
  imports: [
    ImportedFileSelectionComponent,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './remap-ptm-positions-modal.component.html',
  styleUrl: './remap-ptm-positions-modal.component.scss'
})
export class RemapPtmPositionsModalComponent {

  form = this.fb.group({
    fasta_file: new FormControl(null),
    file_path: new FormControl<string|null>(null, Validators.required),
    peptide_column: new FormControl<string|null>(null, Validators.required),
    position_in_peptide_column: new FormControl<string|null>(null, Validators.required),
    uniprot_acc_column: new FormControl<string|null>(null, Validators.required),
  })

  columns: string[] = []

  constructor(private fb: FormBuilder, private modal: NgbActiveModal, private electronService: ElectronService) {

  }

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

  load_example() {
    const ptm_positions = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep + "app.asar", ""),
      'examples',
      'ptm_positions'
    )

    this.form.controls["file_path"].setValue(this.electronService.path.join(ptm_positions, 'different.txt'))
    const firstLine = this.electronService.getFirstLine(this.electronService.path.join(ptm_positions, 'different.txt'))
    if (firstLine) {
      this.columns = firstLine.split('\t')
    }
    this.form.controls["peptide_column"].setValue("Peptide")
    this.form.controls["position_in_peptide_column"].setValue("Position.in.peptide")
    this.form.controls["uniprot_acc_column"].setValue("ProteinID")

  }


}
