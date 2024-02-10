import {Component, Input} from '@angular/core';
import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import {DataFrame, IDataFrame} from "data-forge";
import {ElectronService} from "../../core/services";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {NgxColorsModule} from "ngx-colors";
import {ConditionColorAssignmentComponent} from "../condition-color-assignment/condition-color-assignment.component";
PlotlyModule.plotlyjs = PlotlyJS;
@Component({
  selector: 'app-phate-plot',
  standalone: true,
  imports: [
    PlotlyModule,
    NgxColorsModule,
    ReactiveFormsModule,
    ConditionColorAssignmentComponent
  ],
  templateUrl: './phate-plot.component.html',
  styleUrl: './phate-plot.component.scss'
})
export class PhatePlotComponent {
  _data: IDataFrame<number, {x_phate: number, y_phate: number, z_phate?: number, sample: string}> = new DataFrame()
  _annotation: IDataFrame<number, {Sample: string, Condition: string}> = new DataFrame()
  conditions: string[] = []
  _jobId: string = ''
  @Input() set jobId(value: string) {
    this._jobId = value
  }
  get jobId(): string {
    return this._jobId
  }
  @Input() set annotation(value: IDataFrame<number, {Sample: string, Condition: string}>) {
    this._annotation = value
    this.conditions = this._annotation.getSeries('Condition').distinct().toArray()
    const form: any = {}
    if (this.electronService.fs.existsSync(this.electronService.path.join(this.electronService.settings.resultStoragePath, this.jobId, `annotation_color.json`))) {
      const annotationColor = JSON.parse(this.electronService.fs.readFileSync(this.electronService.path.join(this.electronService.settings.resultStoragePath, this.jobId, `annotation_color.json`), 'utf-8'))
      for (const c of this.conditions) {
        if (annotationColor[c]) {
          form[c] = new FormControl<string>(annotationColor[c])
        } else {
          form[c] = new FormControl<string>('')
        }
      }

    } else {
      if (this.conditions.length > 0) {
        for (const c of this.conditions) {
          form[c] = new FormControl<string>('')
        }
      }
    }
    this.form = this.fb.group(form)
  }

  get annotation(): IDataFrame<number, {Sample: string, Condition: string}> {
    return this._annotation
  }

  @Input() set data(value: IDataFrame<number, {x_phate: number, y_phate: number, z_phate?: number, sample: string}>) {
    this._data = value
    if (this._data.count() > 0) {
      this.drawPlot()
    }
  }
  get data(): IDataFrame<number, {x_phate: number, y_phate: number, z_phate?: number, sample: string}> {
    return this._data
  }
  graphData: any[] = []
  graphLayout: any = {
    scene: {
      xaxis: {
        title: 'Phate 1'
      },
      yaxis: {
        title: 'Phate 2'
      },
      zaxis: {
        title: 'Phate 3'
      }
    },
    width: 600,
    height: 600,
    margin: {
      l: 40,
      r: 40,
      b: 40,
      t: 40,
    },
    xaxis: {
      title: 'Phate 1'
    },
    yaxis: {
      title: 'Phate 2'
    },
    legend: {
      orientation: 'h'
    }
  }

  @Input() set fromFile(txtFile: string) {
    this.electronService.dataForgeFS.readFile(txtFile).parseCSV().then((df: IDataFrame<number, {x_phate: number, y_phate: number, z_phate?: number, sample: string}>) => {
      this.data = df
    })
  }

  revision: number = 0

  form: FormGroup = this.fb.group({

  })
  constructor(private electronService: ElectronService, private fb: FormBuilder, private modal: NgbModal){

  }

  ngAfterViewInit() {

  }

  drawPlot() {
    const first = this._data.first()
    let graphData: any[] = []
    if (this.annotation.count() === 0) {
      const x = this._data.getSeries('x_phate').toArray()
      const y = this._data.getSeries('y_phate').toArray()
      if (first.z_phate) {
        const z = this._data.getSeries('z_phate').toArray()
        graphData = [
          {
            x: x,
            y: y,
            z: z,
            mode: 'markers',
            type: 'scatter3d',
            text: this._data.getSeries('sample').toArray(),
            marker: { size: 12 }
          }
        ]
      } else {
        graphData = [
          {
            x: x,
            y: y,
            mode: 'markers',
            type: 'scatter',
            text: this._data.getSeries('sample').toArray(),
            marker: { size: 12 }
          }
        ]
      }
    } else {
      const joined = this._data.join(this._annotation, row => row.sample, row => row.Sample, (l, r) => {
        return {
          x_phate: l.x_phate,
          y_phate: l.y_phate,
          z_phate: l.z_phate,
          sample: l.sample,
          condition: r.Condition
        }
      })

      let position = 0
      for (const g of joined.groupBy(row => row.condition)) {
        let color = ''
        if (this.form.controls[g.first().condition].value === '') {
          color = this.electronService.settings.defaultColorList[position%this.electronService.settings.defaultColorList.length]
          this.form.controls[g.first().condition].setValue(color)
        } else {
          color = this.form.controls[g.first().condition].value
        }
        const x = g.getSeries('x_phate').toArray()
        const y = g.getSeries('y_phate').toArray()
        if (first.z_phate) {
          const z = g.getSeries('z_phate').toArray()
          graphData.push({
            x: x,
            y: y,
            z: z,
            mode: 'markers',
            type: 'scatter3d',
            text: g.getSeries('sample').toArray(),
            name: g.first().condition,
            marker: { size: 12,
              color: color, }
          })
        } else {
          graphData.push({
            x: x,
            y: y,
            mode: 'markers',
            type: 'scatter',
            text: g.getSeries('sample').toArray(),
            name: g.first().condition,
            marker: { size: 12,
              color: color, }
          })
        }
        position ++
      }
    }
    this.graphData = graphData
    if (this.jobId !== '') {
      this.electronService.fs.writeFileSync(this.electronService.path.join(this.electronService.settings.resultStoragePath, this.jobId, `annotation_color.json`), JSON.stringify(this.form.value))
    }
    this.revision += 1
  }
}
