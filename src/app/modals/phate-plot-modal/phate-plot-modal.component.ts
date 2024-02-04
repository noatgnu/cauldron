import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {ElectronService} from "../../core/services";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {PhatePlotComponent} from "../../plots/phate-plot/phate-plot.component";
import {PcaPlotComponent} from "../../plots/pca-plot/pca-plot.component";

@Component({
  selector: 'app-phate-plot-modal',
  standalone: true,
  imports: [
    PhatePlotComponent,
    PcaPlotComponent
  ],
  templateUrl: './phate-plot-modal.component.html',
  styleUrl: './phate-plot-modal.component.scss'
})
export class PhatePlotModalComponent {
  phateData: IDataFrame<number, {x_phate: number, y_phate: number, z_phate?: number, sample: string}> = new DataFrame()
  @Input() jobId: string = ''
  @Input() annotation: IDataFrame<number, {Sample: string, Condition: string}> = new DataFrame()
  @Input() set txtFile(value: string) {
    this.electronService.dataForgeFS.readFile(value).parseCSV().then((df: IDataFrame<number, {x_phate: number, y_phate: number, z_phate?: number, sample: string}>) => {
      this.phateData = df
    })
  }

  constructor(private electronService: ElectronService, private activeModal: NgbActiveModal) {
  }

  close() {
    this.activeModal.close()
  }

  savePlotSettings() {
    this.electronService.fs.writeFileSync(this.electronService.path.join(this.electronService.settings.resultStoragePath, this.jobId, 'pca-plot-settings.json'), JSON.stringify(this))
  }
}
