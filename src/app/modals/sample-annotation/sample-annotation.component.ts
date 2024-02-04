import {Component, Input} from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {DataFrame, IDataFrame} from "data-forge";

@Component({
  selector: 'app-sample-annotation',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './sample-annotation.component.html',
  styleUrl: './sample-annotation.component.scss'
})
export class SampleAnnotationComponent {
  _samples: string[] = []
  @Input() set samples(value: string[]) {
    this._samples = value
    const data: any[] = []
    for (const s of value) {
      data.push({Sample: s, Condition: ''})
    }
    this._annotation = data
  }
  _annotation: {Sample: string, Condition: string}[] = []
  get samples(): string[] {
    return this._samples
  }

  @Input() set annotation(value: IDataFrame<number, {Sample: string, Condition: string}>) {
    this._annotation = value.toArray()
  }
  get annotation():{Sample: string, Condition: string}[] {
    return this._annotation
  }

  @Input() mode: 'edit' | 'create' = 'edit'



  constructor( private activeModal: NgbActiveModal) {

  }

  save() {
    this.activeModal.close(this._annotation)
  }

  close() {
    this.activeModal.dismiss()
  }

  addSample() {
    this._annotation.push({Sample: '', Condition: ''})
  }

  parseFromClipboard(column: 'Sample'|'Condition') {
    navigator.clipboard.readText().then(text => {
      const lines = text.split(/\r?\n/).filter(l => l.length > 0)

      if (this._annotation.length === lines.length) {
        for (let i = 0; i < lines.length; i++) {
          this._annotation[i][column] = lines[i]
        }
      } else {
        for (let i = 0; i < lines.length; i++) {
          if (this._annotation[i]) {
            this._annotation[i][column] = lines[i]
          } else {
            this._annotation.push({Sample: lines[i], Condition: ''})
          }
        }
      }
    })
  }
}
