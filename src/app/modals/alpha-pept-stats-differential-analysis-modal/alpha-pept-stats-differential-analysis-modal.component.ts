import { Component } from '@angular/core';
import {FormBuilder, ReactiveFormsModule, Validators} from "@angular/forms";
import {ElectronService} from "../../core/services";
import {DataFrame, IDataFrame} from "data-forge";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";
import {SharedModule} from "../../shared/shared.module";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-alpha-pept-stats-differential-analysis-modal',
  standalone: true,
  imports: [
    ImportedFileSelectionComponent,
    ReactiveFormsModule,
    SharedModule
  ],
  templateUrl: './alpha-pept-stats-differential-analysis-modal.component.html',
  styleUrl: './alpha-pept-stats-differential-analysis-modal.component.scss'
})
export class AlphaPeptStatsDifferentialAnalysisModalComponent {
  normalizationMethods: string[] = ["zscore", "quantile", "linear", "vst"]
  imputationMethods: string[] = ["mean", "median", "knn", "randomforest"]
  testMethods: string[] = ["wald", "welch-ttest", "ttest", "sam", "paired-ttest", "limma"]

  engines: string[] = ["spectronaut", "maxquant", "fragpipe", "diann", "generic"]

  form = this.fb.group({
    input_file: ["", Validators.required],
    annotation_file: ["", Validators.required],
    engine: ["generic", Validators.required],
    evidence_file: [""],
    index_col: ["", Validators.required],
    data_completeness: [0.3, Validators.required],
    merge_columns: [""],
    merge_columns_list: [[],],
    method: ["welch-ttest", Validators.required],
    imputation: ["knn", Validators.required],
    normalization: ["quantile", Validators.required],
    log2: [true, Validators.required],
    batch_correction: [false],
  })



  comparisons: {condition_A: string, condition_B: string, comparison_label: string}[] = []

  columns: string[] = []
  conditions: string[] = []
  annotations: IDataFrame<number, {Sample: string, Condition: string}> = new DataFrame()

  constructor(private fb: FormBuilder, private electronService: ElectronService, private activeModal: NgbActiveModal) {
  }

  openFile(fileType: string) {
    this.electronService.remote.dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [
        {name: 'All Files', extensions: ['*']},
        {name: 'tabular file', extensions: ['tsv', 'txt', 'csv']},
      ]
    }).then(result => {
      if (!result.canceled) {
        // @ts-ignore
        this.form.controls[fileType].setValue(result.filePaths[0])
        if (fileType === "annotation_file") {
          this.electronService.dataForgeFS.readFile(result.filePaths[0]).parseCSV().then(
            (df) => {
              this.annotations = df
              this.conditions = df.getSeries('Condition').distinct().toArray()
            }
          )

        } else if (fileType === "input_file") {
          const line = this.electronService.getFirstLine(result.filePaths[0])
          if (line) {
            this.columns = line.split('\t')
          }
        }
      }
    })
  }

  // @ts-ignore
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
    // @ts-ignore
    const line = this.electronService.getFirstLine(this.form.controls['input_file'].value)
    if (line) {
      this.columns = line.split('\t')
    }
    this.form.controls['annotation_file'].setValue(this.electronService.path.join(differentialAnalysisFolder, 'annotation.txt'))
    // @ts-ignore
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
    this.form.controls['index_col'].setValue("Precursor.Id")
    this.form.controls['merge_columns'].setValue("Protein.Ids,Genes")
    // @ts-ignore
    this.form.controls['merge_columns_list'].setValue(["Protein.Ids", "Genes"])
    this.form.controls['evidence_file'].setValue(null)
    this.form.controls['data_completeness'].setValue(0.3)
    this.form.controls['imputation'].setValue("knn")
    this.form.controls['normalization'].setValue("quantile")
    this.form.controls['method'].setValue("welch-ttest")
    this.form.controls['engine'].setValue("generic")
    this.form.controls['log2'].setValue(true)
  }

  updateFormWithSelected(e: string, formControl: string) {
    // @ts-ignore
    this.form.controls[formControl].setValue(e)
  }

  close() {
    this.activeModal.dismiss()
  }

  addContrast() {
    this.comparisons.push({condition_A: '', condition_B: '', comparison_label: ''})
  }

  submit() {
    if (this.form.valid) {
      // @ts-ignore
      const payload: {log2: boolean, input_file: string, annotation_file: string, index_col: string, evidence_file: string, data_completeness: number, imputation: string, normalization: string, method: string, merge_columns_list: string[], engine: string, batch_correction: boolean, comparisons: {condition_A: string, condition_B: string, comparison_label: string}[]} = Object.assign({}, this.form.value)
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

}
