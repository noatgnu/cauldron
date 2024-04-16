import {Component, Input} from '@angular/core';
import {NgStyle} from "@angular/common";

@Component({
  selector: 'app-sequence-viewer',
  standalone: true,
  imports: [
    NgStyle
  ],
  templateUrl: './sequence-viewer.component.html',
  styleUrl: './sequence-viewer.component.scss'
})
export class SequenceViewerComponent {
  _sequence: string = '';
  sequenceArray: string[] = []
  @Input() set sequence(value: string) {
    if (value) {
      this._sequence = value;
      this.sequenceArray = this.getSequenceArray();
      console.log(this._sequence)
    }

  }
  _highlight: {start: number, end: number}[] = []
  highlightPositionsColorMap: {[key: string]: string} = {

  }
  @Input() set highlight(value: {start: number, end: number}[]) {
    this._highlight = value;
    this.highlightPositionsColorMap = {}
    for (const h of value) {
      for (let i = h.start-1; i < h.end+1; i++) {
        this.highlightPositionsColorMap[i] = "yellow";
      }
    }
    this.sequenceArray = [...this.sequenceArray]
  }

  get highlight(): {start: number, end: number}[] {
    return this._highlight;
  }

  get sequence(): string {
    return this._sequence;
  }

  constructor() {
  }

  getSequenceArray() {
    //split the sequence into an array of characters 50 characters long max
    const sequenceArray = []
    let i = 0;
    while (i < this.sequence.length) {
      sequenceArray.push(this.sequence.slice(i, i + 50))
      i += 50;
    }
    return sequenceArray;
  }

  checkIfHighlighted(index: number) {
    return this.highlightPositionsColorMap[index]
  }
}
