import {Component, Input} from '@angular/core';
import {VolcanoPlotComponent} from "../../plots/volcano-plot/volcano-plot.component";
import {ElectronService} from "../../core/services";
import {DataFrame, IDataFrame} from "data-forge";
import {VolcanoDataRow} from "../../plots/volcano-plot/volcano-data-row";

@Component({
  selector: 'app-volcano-plot-modal',
  standalone: true,
  imports: [
    VolcanoPlotComponent
  ],
  templateUrl: './volcano-plot-modal.component.html',
  styleUrl: './volcano-plot-modal.component.scss'
})
export class VolcanoPlotModalComponent {
  _differentialAnalysisFile: string = ''
  @Input() log2FoldChangeColumn: string = 'logFC'

  @Input() pValueColumn: string = 'adj.P.Val'
  @Input() comparisonColumn: string = 'comparison'
  @Input() indexCols: string[] = []

  comparisons: string[] = []

  dfFile: IDataFrame<number, any> = new DataFrame()

  @Input() set differentialAnalysisFile(value: string) {
    this._differentialAnalysisFile = value
    if (this.electronService.fs.existsSync(this._differentialAnalysisFile)) {
      this.electronService.dataForgeFS.readFile(this._differentialAnalysisFile).parseCSV().then((df: IDataFrame<number, any>) => {
        this.dfFile = df
        this.comparisons = this.dfFile.getSeries(this.comparisonColumn).distinct().toArray()
        const data: VolcanoDataRow[] = []
        df.where((row: any) => {
          return row[this.comparisonColumn] === this.comparisons[0]
        }).forEach((row: any) => {
          const newRow: VolcanoDataRow = {
            label: this.indexCols.map((col) => row[col]).join("|"),
            index: this.indexCols.map((col) => row[col]).join("|"),
            x: row[this.log2FoldChangeColumn],
            y: -Math.log10(row[this.pValueColumn])
          }
          data.push(newRow)
        })
        this.df = new DataFrame(data)
        this.revision++
      })
    }
  }
  revision: number = 0
  get differentialAnalysisFile(): string {
    return this._differentialAnalysisFile
  }
  df: IDataFrame<number, VolcanoDataRow> = new DataFrame()

  constructor(private electronService: ElectronService) {

  }

}
