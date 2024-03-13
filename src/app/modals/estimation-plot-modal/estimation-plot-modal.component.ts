import { Component } from '@angular/core';
import {NgbActiveModal, NgbTypeahead} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {ImportedFileSelectionComponent} from "../../imported-file-selection/imported-file-selection.component";
import {SharedModule} from "../../shared/shared.module";
import {ElectronService} from "../../core/services";
import {DataFrame, IDataFrame} from "data-forge";
import {debounceTime, distinctUntilChanged, map, Observable, OperatorFunction} from "rxjs";

@Component({
  selector: 'app-estimation-plot-modal',
  standalone: true,
  imports: [
    ImportedFileSelectionComponent,
    ReactiveFormsModule,
    SharedModule,
    NgbTypeahead,
  ],
  templateUrl: './estimation-plot-modal.component.html',
  styleUrl: './estimation-plot-modal.component.scss'
})
export class EstimationPlotModalComponent {

  form: FormGroup = this.fb.group({
    input_file: new FormControl(null, Validators.required),
    annotation_file: new FormControl(null, Validators.required),
    index_col: new FormControl([], Validators.required),
    log2: new FormControl(true),
    condition_order: new FormControl([], Validators.required),
    selected_protein: new FormControl(null, Validators.required),
  })

  columns: string[] = []
  annotations: IDataFrame = new DataFrame()
  conditions: string[] = []

  data: string[] = []
  df: IDataFrame = new DataFrame()
  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.data.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );
  constructor(private modal: NgbActiveModal, private fb: FormBuilder, private electronService: ElectronService) {
    this.form.controls['index_col'].valueChanges.subscribe((value) => {
      if (value) {
        this.electronService.dataForgeFS.readFile(this.form.controls['input_file'].value).parseCSV().then(df => {
          this.data = df.getSeries(value).distinct().toArray()
        })
      }

    })
  }

  close() {
    this.modal.dismiss()
  }

  submit() {
    this.modal.close(this.form.value)
  }

  updateFormWithSelected(e: string, formControl: string) {
    this.form.controls[formControl].setValue(e)
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
        if (fileType === "annotation_file") {
          this.electronService.dataForgeFS.readFile(result.filePaths[0]).parseCSV().then(
            (df) => {
              this.annotations = df
              this.conditions = df.getSeries('Condition').distinct().toArray()
              this.form.controls['condition_order'].setValue(this.conditions)
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
        this.form.controls['condition_order'].setValue(this.conditions)
      }
    )

    this.form.controls['log2'].setValue(true)
    this.form.controls['index_col'].setValue("Precursor.Id")
  }

  moveConditionUp(index: number) {
    if (index > 0) {
      const temp = this.conditions[index]
      this.conditions[index] = this.conditions[index-1]
      this.conditions[index-1] = temp
      this.form.controls['condition_order'].setValue(this.conditions)
    }
  }

  moveConditionDown(index: number) {
    if (index < this.conditions.length - 1) {
      const temp = this.conditions[index]
      this.conditions[index] = this.conditions[index+1]
      this.conditions[index+1] = temp
      this.form.controls['condition_order'].setValue(this.conditions)
    }
  }
}
