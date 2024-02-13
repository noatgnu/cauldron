import {Component, Input} from '@angular/core';
import {ElectronService} from "../../core/services";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {DataFrame, IDataFrame} from "data-forge";
import {
  FuzzyClusteringPcaPlotComponent
} from "../../plots/fuzzy-clustering-pca-plot/fuzzy-clustering-pca-plot.component";

@Component({
  selector: 'app-fuzzy-clustering-plot-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FuzzyClusteringPcaPlotComponent
  ],
  templateUrl: './fuzzy-clustering-plot-modal.component.html',
  styleUrl: './fuzzy-clustering-plot-modal.component.scss'
})
export class FuzzyClusteringPlotModalComponent {
  _filePathList: string[] = []
  @Input() set filePathList(value: string[]) {
    this._filePathList = value
    if (this._filePathList.length > 0) {
      this.form.controls["selectedFile"].setValue(this._filePathList[0])
    }
  }

  get filePathList(): string[] {
    return this._filePathList
  }

  form: FormGroup = this.fb.group({
    selectedFile: new FormControl(null)
  })

  sepPath = this.electronService.path.sep

  data: IDataFrame<number, {x: number, y: number, Sample: string, Condition: string, cluster: number}> = new DataFrame()
  revision: number = 0

  constructor(private electronService: ElectronService, private activeModal: NgbActiveModal, private fb: FormBuilder) {
    this.form.controls["selectedFile"].valueChanges.subscribe((value) => {
      if (value) {
        this.electronService.dataForgeFS.readFile(value).parseCSV().then((df: IDataFrame<number, any>) => {
          this.data = df
          this.revision += 1
        })
      }
    })
  }

  close() {
    this.activeModal.dismiss()
  }

}
