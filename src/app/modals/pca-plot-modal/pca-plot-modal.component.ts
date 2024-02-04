import {Component, Input} from '@angular/core';
import {IDataFrame, DataFrame} from "data-forge";
import {ElectronService} from "../../core/services";
import {PcaPlotComponent} from "../../plots/pca-plot/pca-plot.component";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-pca-plot-modal',
  standalone: true,
  imports: [
    PcaPlotComponent
  ],
  templateUrl: './pca-plot-modal.component.html',
  styleUrl: './pca-plot-modal.component.scss'
})
export class PcaPlotModalComponent {
  pcaData: IDataFrame<number, {x_pca: number, y_pca: number, z_pca?: number, sample: string}> = new DataFrame()
  @Input() jobId: string = ''
  @Input() annotation: IDataFrame<number, {Sample: string, Condition: string}> = new DataFrame()
  @Input() set txtFile(value: string) {
    this.electronService.dataForgeFS.readFile(value).parseCSV().then((df: IDataFrame<number, {x_pca: number, y_pca: number, z_pca?: number, sample: string}>) => {
      this.pcaData = df
    })
  }

  explainedVariance: number[] = []

  @Input() set jsonFile(value: string) {
    const data = this.electronService.fs.readFileSync(value, 'utf8')
    console.log(data)
    if (data) {
      this.explainedVariance = JSON.parse(data)
    }
  }

  constructor(private electronService: ElectronService, private activeModal: NgbActiveModal) {
  }

  close() {
    this.activeModal.close()
  }

  savePlotSettings() {
    this.electronService.fs.writeFileSync(this.electronService.path.join(this.electronService.settings.resultStoragePath, this.jobId, 'pca-plot-settings.json'), JSON.stringify(this.explainedVariance))
  }

}
