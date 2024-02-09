import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {SharedModule} from "../../shared/shared.module";
import {DataFrame, IDataFrame} from "data-forge";
import {ElectronService} from "../../core/services";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";

@Component({
  selector: 'app-qfeatures-limma-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SharedModule,
    ImportedFileSelectionComponent
  ],
  templateUrl: './qfeatures-limma-modal.component.html',
  styleUrl: './qfeatures-limma-modal.component.scss'
})
export class QfeaturesLimmaModalComponent {
  normalizationMethods: string[] = ["sum", "max", "center.mean", "center.median", "div.mean", "div.median", "diff.meda", "quantiles", "quantiles.robust", "vsn"]
  imputationMethods: string[] = ["neighbour_average", "knn", "mle", "mle2", "bpca", "mixed", "min", "MinDet", "MinProb", "QRILC", "zero", "RF"]

  form: FormGroup = this.fb.group({
    input_file: new FormControl(null, Validators.required),
    annotation_file: new FormControl(null, Validators.required),
    index_col: new FormControl([], Validators.required),
    log2: new FormControl(true),
    normalization: new FormControl("quantiles.robust", Validators.required),
    imputation: new FormControl("knn", Validators.required),
    rowFilter: new FormControl(0.7, Validators.required),
    colFilter: new FormControl(0.7, Validators.required),
    aggregateColumn: new FormControl(""),
    aggregateMethod: new FormControl("MsCoreUtils::robustSummary", Validators.required),
  })
  comparisons: {condition_A: string, condition_B: string, comparison_label: string}[] = []

  columns: string[] = []
  conditions: string[] = []
  annotations: IDataFrame<number, {Sample: string, Condition: string}> = new DataFrame()
  constructor(private fb: FormBuilder, private electronService: ElectronService, private activeModal: NgbActiveModal) { }

  openFile(fileType: string) {
    this.electronService.remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {name: 'All Files', extensions: ['*']},
        {name: 'tabular file', extensions: ['tsv', 'txt', 'csv']},
      ]
    }).then(result => {
      if (!result.canceled) {
        this.form.controls[fileType].setValue(result.filePaths[0])
        if (fileType === "annotation_file") {
          this.electronService.dataForgeFS.readFile(result.filePaths[0]).parseCSV().then(
            (df) => {
              this.annotations = df
              this.conditions = df.getSeries('Condition').distinct().toArray()
            }
          )

        } else {
          const line = this.electronService.getFirstLine(result.filePaths[0])
          if (line) {
            this.columns = line.split('\t')
          }
        }
      }
    })
  }
  loadExample() {
    const diannFolder = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep + "app.asar", ""),
      'examples',
      'diann'
    )
    const differentialAnalysisFolder = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep + "app.asar", ""),
      'examples',
      'differential_analysis'
    )

    this.form.controls['input_file'].setValue(this.electronService.path.join(diannFolder, 'imputed.data.txt'))
    const line = this.electronService.getFirstLine(this.form.controls['input_file'].value)
    if (line) {
      this.columns = line.split('\t')
    }
    this.form.controls['annotation_file'].setValue(this.electronService.path.join(differentialAnalysisFolder, 'annotation.txt'))
    this.electronService.dataForgeFS.readFile(this.form.controls['annotation_file'].value).parseCSV().then(
      (df) => {
        this.annotations = df
        this.conditions = df.getSeries('Condition').distinct().toArray()
      }
    )
    this.electronService.dataForgeFS.readFile(this.electronService.path.join(differentialAnalysisFolder, 'comparison.bca.txt')).parseCSV().then(
      (df) => {
        for (const r of df) {
          this.comparisons.push({condition_A: r['condition_A'], condition_B: r['condition_B'], comparison_label: r['comparison_label']})
        }
      }
    )
    this.form.controls['log2'].setValue(true)
    this.form.controls['index_col'].setValue("Protein.Ids,Precursor.Id".split(','))
  }

  close() {
    this.activeModal.dismiss()
  }

  submit() {
    if (this.form.valid) {
      const payload: {input_file: string, annotation_file: string, index_col: string[], log2: boolean, comparisons: {condition_A: string, condition_B: string, comparison_label: string}[]} = Object.assign({}, this.form.value)
      for (const c of this.comparisons) {
        if (this.conditions.indexOf(c.condition_A) === -1 || this.conditions.indexOf(c.condition_B) === -1 || c.comparison_label === '') {
          alert("Please select valid conditions for all comparisons")
          return
        }
      }
      payload.comparisons = this.comparisons
      this.activeModal.close(payload)
    }

  }

  addContrast() {
    this.comparisons.push({condition_A: '', condition_B: '', comparison_label: ''})
  }

  updateFormWithSelected(e: string, formControl: string) {
    this.form.controls[formControl].setValue(e)
  }
}
