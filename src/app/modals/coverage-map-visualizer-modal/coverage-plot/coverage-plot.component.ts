import {Component, Input} from '@angular/core';
import {PlotlyModule} from "angular-plotly.js";
import {DataFrame, IDataFrame} from "data-forge";
import * as chroma from "chroma-js";
import * as PlotlyJS from "plotly.js-dist-min";

PlotlyModule.plotlyjs = PlotlyJS;

@Component({
  selector: 'app-coverage-plot',
  standalone: true,
  imports: [
    PlotlyModule
  ],
  templateUrl: './coverage-plot.component.html',
  styleUrl: './coverage-plot.component.scss'
})
export class CoveragePlotComponent {
  graphData: any[] = []
  graphLayout: any = {
    margin: {
      l: 50,
      r: 50,
      b: 50,
      t: 50,
    },
    title: 'Coverage Plot',
    width: 1000,
    height: 200,
    xaxis: {
      title: 'Position'
    },
    yaxis: {
      title: '',
      tickmode: 'array',
      showticklabels: false,

    }
  }
  _sequence: string = ''
  @Input() set sequence(value: string) {
    this._sequence = value
  }
  get sequence(): string {
    return this._sequence
  }

  _data: IDataFrame<{MatchACC: string, RawFile: string, Precursor: string, StartPos: number, EndPos: number, Height: number, Value: number}> = new DataFrame()
  @Input() set data(value: IDataFrame<{MatchACC: string, RawFile: string, Precursor: string, StartPos: number, EndPos: number, Height: number, Value: number}>) {
    this._data = value
    console.log(value)
    const minValue = value.getSeries("Value").min()
    const maxValue = value.getSeries("Value").max()
    this.gradient = chroma.scale(['#042fd9', '#6dfde7', '#fdfb6d', '#fd876d']).domain([minValue, maxValue])
    const temp: any = {
      x: [],
      y: [1],
      z: [[]],
      xgap: 1,
      ygap: 1,
      showscale: false,
      type: 'heatmap',
      colorscale: [],
      zmin: minValue,
      zmax: maxValue,
    }
    console.log(this.gradient)
    const tickvals: number[] = []
    const ticktext: string[] = []
    for (let i=0; i<=1; i = i + 0.1) {
      const value= i*( maxValue -minValue) + minValue
      console.log(value)
      // @ts-ignore
      const rgbColor = this.gradient(value)._rgb
      console.log(rgbColor)
      const color = `rgb(${rgbColor._unclipped[0]}, ${rgbColor._unclipped[1]}, ${rgbColor._unclipped[2]})`
      temp.x.push(i)
      temp.z[0].push(value)
      temp.colorscale.push([i, color])
      tickvals.push(i)
      ticktext.push(value.toFixed(1))
    }
    temp.colorscale[temp.colorscale.length-1][0] = 1
    this.gradientData = [temp]
    this.gradientLayout.width = 20*temp.x.length + this.gradientLayout.margin.l + this.gradientLayout.margin.r
    this.gradientLayout.height = 20 + this.gradientLayout.margin.b + this.gradientLayout.margin.t
    this.gradientLayout.xaxis.tickvals = tickvals
    this.gradientLayout.xaxis.ticktext = ticktext
    this.drawPlot()
  }
  gradient: chroma.Scale<chroma.Color>|undefined = undefined
  gradientData: any[] = []
  gradientLayout: any = {
    margin: {
      l: 0,
      r: 0,
      b: 100,
      t: 0,
    },
    height: 50,
    width: 50,
    xaxis: {
      title: '',
      type: 'category',
      tickmode: 'array',
      showticklabels: true,
      tickvals: [],
      ticktext: [],
      fixedrange: true,
    },
    yaxis: {
      title: '',
      type: 'category',
      tickmode: 'array',
      fixedrange: true,
    }
  }
  revision: number = 0
  get data(): IDataFrame<{MatchACC: string, RawFile: string, Precursor: string, StartPos: number, EndPos: number, Height: number, Value: number}> {
    return this._data
  }
  constructor() {
  }

  drawPlot() {
    const temp: any = {}
    const y: string[] = []
    this.data.groupBy(row => row.MatchACC+row.RawFile).forEach(group => {
      const acc = group.first().MatchACC
      const sample = group.first().RawFile
      if (!temp[acc]) {
        temp[acc] = {}
      }
      if (!temp[acc][sample]) {
        temp[acc][sample] = []
      }
      group.forEach(row => {
        if (this.gradient) {
          // @ts-ignore
          const color = this.gradient(row.Value)._rgb
          const graph: any = {
            x: [],
            y: [],
            text: [],
            type: 'scatter',
            mode: 'lines',
            line: {
              color: `rgb(${color._unclipped[0]}, ${color._unclipped[1]}, ${color._unclipped[2]})`,
              width: 3
            },
            name: row.Precursor,
            showlegend: false,
          }
          for (let i=row.StartPos; i<=row.EndPos; i++) {
            graph.x.push(i)
            graph.y.push(`${row.RawFile} ${row.Height}`)
            if (y.indexOf(`${row.RawFile} ${row.Height}`) === -1) {
              y.push(`${row.RawFile} ${row.Height}`)
            }
            graph.text.push(`${row.RawFile}<br>${row.Precursor}<br>${row.Height}<br>${row.Value}`)
          }
          temp[acc][sample].push(graph)
        }
      })
    })
    let graphData: any[] = []

    for (const acc in temp) {
      for (const sample in temp[acc]) {

        graphData.push(...temp[acc][sample])
      }
    }
    const sequence = {
      x: [1, this.sequence.length],
      y: ['Sequence', 'Sequence'],
      type: 'scatter',
      mode: 'lines',
      line: {
        color: 'black',
        width: 3
      },
      name: 'Sequence',
      showlegend: false,

    }
    graphData = [sequence, ...graphData]
    this.graphLayout.height = 30*y.length + this.graphLayout.margin.b + this.graphLayout.margin.t
    this.graphData = graphData
    this.revision++
  }
}
