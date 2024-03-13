import {AfterViewInit, Component, Input} from '@angular/core';

import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import {DataFrame, IDataFrame} from "data-forge";
import {ElectronService} from "../../core/services";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ConditionColorAssignmentComponent} from "../condition-color-assignment/condition-color-assignment.component";
PlotlyModule.plotlyjs = PlotlyJS;
@Component({
  selector: 'app-fuzzy-clustering-pca-plot',
  standalone: true,
  imports: [
    PlotlyModule
  ],
  templateUrl: './fuzzy-clustering-pca-plot.component.html',
  styleUrl: './fuzzy-clustering-pca-plot.component.scss'
})
export class FuzzyClusteringPcaPlotComponent {
  @Input() data: IDataFrame<number, {x: number, y: number, Sample: string, Condition: string, cluster: number}> = new DataFrame()

  _revision: number = 0

  @Input() set revision(value: number) {
    this.updatePlot()
    this._revision = value
  }

  get revision(): number {
    return this._revision
  }

  graphData: any[] = []
  graphLayout: any = {
    title: 'Fuzzy Clustering PCA',
    xaxis: {
      title: 'PC1',
      type: 'linear',
    },
    yaxis: {
      title: 'PC2',
      type: 'linear',
    }
  }

  constructor() {

  }

  updatePlot() {
    if (this.data.count() > 0) {
      const graphData: any[] = []
      this.data.groupBy(row => row.cluster).forEach((group) => {
        const data: any = {
          x: [],
          y: [],
          text: [],
          mode: 'markers',
          type: 'scatter',
          name: `Cluster ${group.first().cluster}`
        }
        group.forEach((row) => {
          data.x.push(row.x)
          data.y.push(row.y)
          data.text.push(`Sample:${row.Sample}<br>Condition:(${row.Condition})<br>Cluster:${row.cluster}`)
        })
        graphData.push(data)
      })
      this.graphData = graphData
    }
  }

}
