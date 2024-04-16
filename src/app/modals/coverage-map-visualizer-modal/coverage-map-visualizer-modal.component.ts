import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {FormBuilder, FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {SequenceViewerComponent} from "./sequence-viewer/sequence-viewer.component";
import {CoveragePlotComponent} from "./coverage-plot/coverage-plot.component";

@Component({
  selector: 'app-coverage-map-visualizer-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SequenceViewerComponent,
    CoveragePlotComponent
  ],
  templateUrl: './coverage-map-visualizer-modal.component.html',
  styleUrl: './coverage-map-visualizer-modal.component.scss'
})
export class CoverageMapVisualizerModalComponent {
  _uniprotData: IDataFrame<{Entry: string, Sequence: string}> = new DataFrame();
  _coverageData: IDataFrame<{MatchACC: string, RawFile: string, Precursor: string, StartPos: number, EndPos: number, Height: number, Value: number}> = new DataFrame();

  @Input() set uniprotData(value: IDataFrame<{Entry: string, Sequence: string}>) {
    this._uniprotData = value;
  }

  get uniprotData(): IDataFrame<{Entry: string, Sequence: string}> {
    return this._uniprotData;
  }

  @Input() set coverageData(value: IDataFrame<{MatchACC: string, RawFile: string, Precursor: string, StartPos: number, EndPos: number, Height: number, Value: number}>) {
    value = value.map(row => {
      row.StartPos = parseInt(row.StartPos)
      row.EndPos = parseInt(row.EndPos)
      row.Height = parseInt(row.Height)
      row.Value = parseInt(row.Value)
      return row
    })
    this._coverageData = value;
  }

  get coverageData(): IDataFrame<{MatchACC: string, RawFile: string, Precursor: string, StartPos: number, EndPos: number, Height: number, Value: number}> {
    return this._coverageData;
  }

  form = this.fb.group({
    accession: new FormControl<string|null>(null, Validators.required),
    sample: new FormControl<string[]>([], Validators.required),
  })
  selectedSequence: string = '';

  highlightPositions: {start: number, end: number}[] = []
  selectedData: IDataFrame<{MatchACC: string, RawFile: string, Precursor: string, StartPos: number, EndPos: number, Height: number, Value: number}> = new DataFrame()

  constructor(private fb: FormBuilder) {

  }
  viewData() {
    if (this.form.valid) {
      if (this.form.controls.accession.value) {
        this.viewSequence(this.form.controls.accession.value)
        if (this.form.controls.sample.value) {
          this.getHighlightPositions(this.form.controls.accession.value, this.form.controls.sample.value)
          if (this.form.controls.sample.value !==null) {
            // @ts-ignore
            this.selectedData = this.coverageData.where(row => row.MatchACC === this.form.controls.accession.value && this.form.controls.sample.value.includes(row.RawFile)).bake()
          }
        }
      }
    }
  }
  viewSequence(entry: string) {
    const sequence = this.uniprotData.where(row => row.Entry === entry).getSeries("Sequence").first();
    this.selectedSequence = sequence;
  }

  getHighlightPositions(acc: string, sample: string[]) {
    const coverageData = this.coverageData.where(row => row.MatchACC === acc && sample.includes(row.RawFile)).bake();
    const highlightPositions = coverageData.select(row => {
      return {start: parseInt(row.StartPos), end: parseInt(row.EndPos)}
    }).toArray();
    this.highlightPositions = highlightPositions;
  }
}
