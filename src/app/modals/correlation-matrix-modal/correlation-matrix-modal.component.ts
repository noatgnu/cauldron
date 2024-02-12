import { Component } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";
import {ElectronService} from "../../core/services";

@Component({
  selector: 'app-correlation-matrix-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    ImportedFileSelectionComponent
  ],
  templateUrl: './correlation-matrix-modal.component.html',
  styleUrl: './correlation-matrix-modal.component.scss'
})
export class CorrelationMatrixModalComponent {
  correlationPlotShape: string[] = ["full", "lower", "upper"]
  presentingMethod: string[] = ["circle", "square", "ellipse", "number", "shade", "color", "pie"]
  correlationMethod: string[] = ["pearson", "spearman", "kendall"]
  orderList: string[] = ["original", "AOE", "FPC", "hclust", "alphabet"]
  hclusteringMethod: string[] = ["complete", "ward", "ward.D", "ward.D2", "single", "average",
    "mcquitty", "median", "centroid"]

  form: FormGroup = this.fb.group({
    file_path: new FormControl(null),
    sample_cols: new FormControl([], Validators.required),
    index_col: new FormControl(null, Validators.required),
    method: new FormControl("pearson", Validators.required),
    min_value: new FormControl(null),
    order: new FormControl(null),
    hclust_method: new FormControl("ward.D"),
    presenting_method: new FormControl("ellipse"),
    cor_shape: new FormControl("upper"),
    plot_only: new FormControl(false),
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
    this.form.controls[formControl].setValue(e)
  }

  loadExample() {
    const diannFolder = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep + "app.asar", ""),
      'examples',
      'diann'
    )
    this.form.controls["file_path"].setValue(this.electronService.path.join(diannFolder, 'imputed.data.txt'))
    const firstLine = this.electronService.getFirstLine(this.electronService.path.join(diannFolder, 'imputed.data.txt'))
    if (firstLine) {
      this.columns = firstLine.split('\t')
    }
    const differentialAnalysisFolder = this.electronService.path.join(
      this.electronService.resourcePath.replace(this.electronService.path.sep + "app.asar", ""),
      'examples',
      'differential_analysis'
    )

    this.electronService.dataForgeFS.readFile(this.electronService.path.join(differentialAnalysisFolder, 'annotation.txt')).parseCSV().then(
      (df) => {
        console.log(df.getSeries('Sample').distinct().toArray())
        this.form.controls["sample_cols"].setValue(df.getSeries('Sample').distinct().toArray())
      }
    )
    this.form.controls["index_col"].setValue("Precursor.Id")
    this.form.controls["order"].setValue("hclust")
  }
}
