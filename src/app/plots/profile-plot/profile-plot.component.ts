import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame} from 'data-forge';
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {ElectronService} from "../../core/services";
import {ConditionColorAssignmentComponent} from "../condition-color-assignment/condition-color-assignment.component";
import {PlotlySharedModule} from "angular-plotly.js";

@Component({
  selector: 'app-profile-plot',
  standalone: true,
  imports: [
    ConditionColorAssignmentComponent,
    PlotlySharedModule
  ],
  templateUrl: './profile-plot.component.html',
  styleUrl: './profile-plot.component.scss'
})
export class ProfilePlotComponent {
  _annotation: IDataFrame<number, {Sample: string, Condition: string}> = new DataFrame()
  conditions: string[] = []
  @Input() set annotation(value: IDataFrame<number, {Sample: string, Condition: string}>) {
    this._annotation = value
    this.conditions = this.annotation.getSeries('Condition').distinct().toArray()
    const form: any = {}
    for (const col of this.annotation.getColumnNames()) {
      form[col] = new FormControl(col)
    }
    this.form = this.fb.group(form)
  }

  get annotation(): IDataFrame<number, {Sample: string, Condition: string}> {
    return this._annotation
  }
  _data: IDataFrame<number, any> = new DataFrame()
  @Input() set data(value: IDataFrame<number, any>) {
    this._data = value
    this.drawPlot()
  }

  get data(): IDataFrame<number, any> {
    return this._data
  }

  form: FormGroup = this.fb.group({

  })

  graphData: any[] = []
  graphLayout: any = {
    title: 'Profile Plot',
    width: 1000,
    height: 500,
    xaxis: {
      title: 'Sample'
    },
    yaxis: {
      title: 'Log2 Intensity'
    }
  }
  revision = 0
  constructor(private fb: FormBuilder, private electronService: ElectronService) {

  }

  drawPlot() {
    const graphData = []
    let poisition = 0
    for (const s in this.form.value) {
      // draw box plot

      graphData.push(
        {
          x: this.data.getSeries(s).toArray(),
          y: s,
          line: {
            color: 'black'
          },
          type: 'box',
          name: this.form.value[s],
          boxpoints: false,
          showlegend: false,
        }
      )
    }
    this.graphData = graphData
    this.revision++
  }
}
