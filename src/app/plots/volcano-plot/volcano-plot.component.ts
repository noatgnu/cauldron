import {Component, Input} from '@angular/core';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import {DataFrame, IDataFrame} from "data-forge";
import {VolcanoDataRow} from "./volcano-data-row";
import {VolcanoSelection} from "./volcano-selection";
PlotlyModule.plotlyjs = PlotlyJS;
@Component({
  selector: 'app-volcano-plot',
  standalone: true,
  imports: [
    PlotlyModule
  ],
  templateUrl: './volcano-plot.component.html',
  styleUrl: './volcano-plot.component.scss'
})
export class VolcanoPlotComponent {
  _data: IDataFrame<number, VolcanoDataRow> = new DataFrame()

  @Input() selection: {[key: string]: {selectionLabels: string[], color: string}} = {}

  cutoffGroupMap: {[key: string]: string} = {}

  @Input() set data(value: IDataFrame<number, VolcanoDataRow>) {
    this._data = value
    this._data.forEach((row) => {
      let group = ""
      if (Math.abs(row.x) >= this.log2FoldChangeCutoff) {
        group += "Log2FC >= " + this.log2FoldChangeCutoff
      } else {
        group += "Log2FC < " + this.log2FoldChangeCutoff
      }

      if (row.y >= this.pValueCutoff) {
        group += "; -Log10(p-value) < " + this.pValueCutoff.toFixed(2)
      } else {
        group += "; -Log10(p-value) >= " + this.pValueCutoff.toFixed(2)
      }
      this.cutoffGroupMap[row.index] = group
    })
  }

  get data(): IDataFrame<number, VolcanoDataRow> {
    return this._data
  }

  _revision: number = 0

  @Input() set revision(value: number) {
    this.draw()
  }

  get revision(): number {
    return this._revision
  }

  @Input() pValueCutoff: number = -Math.log10(0.05)
  @Input() log2FoldChangeCutoff: number = 0.6

  @Input() backend: "scatter" | "scattergl" = "scatter"

  graphData: any = []
  graphLayout: any = {
    title: 'Volcano Plot',
    xaxis: {
      title: 'Log2 Fold Change'
    },
    yaxis: {
      title: '-Log10(p-value)'
    }
  }
  constructor() {

  }

  draw() {
    const graphData: any = {}
    console.log(this.data)
    this.data.forEach((row) => {
      if (row.index in this.cutoffGroupMap) {
        if (!graphData[this.cutoffGroupMap[row.index]]) {
          graphData[this.cutoffGroupMap[row.index]] = {
            x: [],
            y: [],
            text: [],
            mode: 'markers',
            type: this.backend,
            name: this.cutoffGroupMap[row.index],
          }
        }
        graphData[this.cutoffGroupMap[row.index]].x.push(row.x)
        graphData[this.cutoffGroupMap[row.index]].y.push(row.y)
        graphData[this.cutoffGroupMap[row.index]].text.push(row.label)
      }
      if (row.index in this.selection) {
        this.selection[row.index].selectionLabels.forEach((label) => {
          if (!graphData[label]) {
            graphData[label] = {
              x: [],
              y: [],
              text: [],
              mode: 'markers',
              type: this.backend,
              name: label,
              marker: {
                color: this.selection[row.index].color
              }
            }
          }
          graphData[label].x.push(row.x)
          graphData[label].y.push(row.y)
          graphData[label].text.push(row.label)
        })
      }
    })
    this.graphData = Object.values(graphData)
    this._revision++
  }
}
