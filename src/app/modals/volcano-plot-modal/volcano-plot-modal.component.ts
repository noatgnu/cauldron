import {Component, Input} from '@angular/core';
import {VolcanoPlotComponent} from "../../plots/volcano-plot/volcano-plot.component";
import {ElectronService} from "../../core/services";
import {DataFrame, IDataFrame} from "data-forge";
import {VolcanoDataRow} from "../../plots/volcano-plot/volcano-data-row";
import {FormBuilder, FormControl, ReactiveFormsModule} from "@angular/forms";
import {NgbActiveModal, NgbProgressbar} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-volcano-plot-modal',
  standalone: true,
  imports: [
    VolcanoPlotComponent,
    ReactiveFormsModule,
    NgbProgressbar
  ],
  templateUrl: './volcano-plot-modal.component.html',
  styleUrl: './volcano-plot-modal.component.scss'
})
export class VolcanoPlotModalComponent {
  _differentialAnalysisFile: string = ''
  @Input() log2FoldChangeColumn: string = 'logFC'

  @Input() pValueColumn: string = 'adj.P.Val'
  @Input() comparisonColumn: string = 'comparison'
  _indexCols: string[] = []
  @Input() set indexCols(value: string[]) {
    this._indexCols = value
    this.form.controls['indexCols'].setValue(value)
  }
  get indexCols(): string[] {
    return this._indexCols
  }

  comparisons: string[] = []

  dfFile: IDataFrame<number, any> = new DataFrame()

  form = this.fb.group({
    pValueCutoff: new FormControl(0.05),
    log2FoldChangeCutoff: new FormControl(0.6),
    pValueColumn: new FormControl(this.pValueColumn),
    log2FoldChangeColumn: new FormControl(this.log2FoldChangeColumn),
    comparison: new FormControl(this.comparisons[0]),
    indexCols: new FormControl(this.indexCols)
  })
  assembling: boolean = false
  @Input() set differentialAnalysisFile(value: string) {
    this._differentialAnalysisFile = value
    if (this.electronService.fs.existsSync(this._differentialAnalysisFile)) {
      this.electronService.dataForgeFS.readFile(this._differentialAnalysisFile).parseCSV().then((df: IDataFrame<number, any>) => {
        this.assembling = true
        this.dfFile = df
        this.comparisons = this.dfFile.getSeries(this.comparisonColumn).distinct().toArray()
        const data: VolcanoDataRow[] = []
        console.log(this.form.controls['comparison'].value)
        let comparison = this.form.controls['comparison'].value
        if (comparison === null) {
          comparison = this.comparisons[0]
          this.form.controls['comparison'].setValue(comparison)
        }
        df.where((row: any) => {
          return row[this.comparisonColumn] === comparison
        }).forEach((row: any) => {
          if (this.form.controls.indexCols.value) {
            const newRow: VolcanoDataRow = {
              label: row[this.form.controls['indexCols'].value[0]],
              index: this.form.controls['indexCols'].value.map((col) => row[col]).join("|"),
              x: parseFloat(row[this.log2FoldChangeColumn]),
              y: -Math.log10(parseFloat(row[this.pValueColumn]))
            }
            data.push(newRow)
          }
        })
        this.df = new DataFrame(data)
        this.assembling = false
        this.revision++
      })
    }
  }
  revision: number = 0
  get differentialAnalysisFile(): string {
    return this._differentialAnalysisFile
  }
  df: IDataFrame<number, VolcanoDataRow> = new DataFrame()

  constructor(private electronService: ElectronService, private fb: FormBuilder, private modal: NgbActiveModal) {

  }

  close() {
    this.modal.dismiss()
  }

}
