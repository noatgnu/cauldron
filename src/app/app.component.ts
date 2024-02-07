import {Component, HostListener, NgZone} from '@angular/core';
import { ElectronService } from './core/services';
import { TranslateService } from '@ngx-translate/core';
import { APP_CONFIG } from '../environments/environment';
import {JobQueueService} from "./job-queue/job-queue.service";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ImputationModalComponent} from "./modals/imputation-modal/imputation-modal.component";
import {
  ProtocolIoCitationExportModalComponent
} from "./modals/protocol-io-citation-export-modal/protocol-io-citation-export-modal.component";
import {NormalizationModalComponent} from "./modals/normalization-modal/normalization-modal.component";
import {PhateModalComponent} from "./modals/phate-modal/phate-modal.component";
import {PcaModalComponent} from "./modals/pca-modal/pca-modal.component";
import {DiannToCurtainptmModalComponent} from "./modals/diann-to-curtainptm-modal/diann-to-curtainptm-modal.component";
import {
  MsfraggerToCurtainptmModalComponent
} from "./modals/msfragger-to-curtainptm-modal/msfragger-to-curtainptm-modal.component";
import {LimmaModalComponent} from "./modals/limma-modal/limma-modal.component";
import {SampleAnnotationComponent} from "./modals/sample-annotation/sample-annotation.component";
import {DataFrame} from "data-forge";
import {QfeaturesLimmaModalComponent} from "./modals/qfeatures-limma-modal/qfeatures-limma-modal.component";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  active: string = "home";

  constructor(
    private electronService: ElectronService,
    private translate: TranslateService,
    public jobQueue: JobQueueService,
    private modal: NgbModal,
    private zone: NgZone,
    private jobQueueService: JobQueueService
  ) {
    this.translate.setDefaultLang('en');
    console.log('APP_CONFIG', APP_CONFIG);

    if (electronService.isElectron) {
      console.log(process.env);
      console.log('Run in electron');
      console.log('Electron ipcRenderer', this.electronService.ipcRenderer);
      console.log('NodeJS childProcess', this.electronService.childProcess);
      this.electronService.dataTransformationChannelSubject.asObservable().subscribe((data) => {
        console.log(data)
        switch (data) {
          case "impute-missing-values":
            zone.run(() => {
              const ref = this.modal.open(ImputationModalComponent, {scrollable: true})
              ref.result.then(async (result) => {
                await this.jobQueueService.queue.createJob({type: 'data-transformation', data:{
                    file_path: result.file_path,
                    method: result.method,
                    k: result.k,
                    strategy: result.strategy,
                    fillValue: result.fillValue,
                    iterations: result.iterations,
                    columns: result.columns,
                    type: 'impute-missing-values'
                  }})
              })
            })
            break;
          case "normalize-data":
            zone.run(() => {
              const ref = this.modal.open(NormalizationModalComponent, {scrollable: true})
              ref.result.then(async (result) => {
                await this.jobQueueService.queue.createJob({type: 'data-transformation', data:{
                  file_path: result.file_path,
                    columns_name: result.columns_name,
                    scaler_type: result.scaler_type,
                    with_centering: result.with_centering,
                    with_scaling: result.with_scaling,
                    n_quantiles: result.n_quantiles,
                    output_distribution: result.output_distribution,
                    norm: result.norm,
                    power_method: result.power_method,
                    type: 'normalize-data'
                  }})
              })
            })
            break;
        }
      })
      this.electronService.citationUtilityChannelSubject.asObservable().subscribe((data) => {
        switch (data) {
          case 'generate-ris-citation':
            zone.run(() =>{
              const ref = this.modal.open(ProtocolIoCitationExportModalComponent)
              ref.result.then(async (result) => {
                await this.jobQueueService.queue.createJob({type: 'citation-utility', data:{
                    idList: result.idList,
                    type: 'generate-ris-citation'
                  }})
              })
            })
        }
      })
      this.electronService.dimensionReductionChannelSubject.asObservable().subscribe((data) => {
        switch (data) {
          case 'pca':
            zone.run(() => {
              const ref = this.modal.open(PcaModalComponent)
              ref.result.then(async (result) => {
                await this.jobQueueService.queue.createJob({type: 'dimensionality-reduction', data:{
                    input_file: result.input_file,
                    columns_name: result.columns_name,
                    n_components: result.n_components,
                    log2: result.log2,
                    type: 'pca'
                  }})
              })
            })
            break
          case 'phate':
            zone.run(() => {
              const ref = this.modal.open(PhateModalComponent)
              ref.result.then(async (result) => {
                await this.jobQueueService.queue.createJob({type: 'dimensionality-reduction', data:{
                    input_file: result.input_file,
                    columns_name: result.columns_name,
                    n_components: result.n_components,
                    log2: result.log2,
                    type: 'phate'
                  }})
              })
            })
            break
        }
      })
      this.electronService.curtainChannelSubject.asObservable().subscribe((data) => {
        switch (data) {
          case 'convert-diann-to-curtainptm':
            zone.run(() => {
              const ref = this.modal.open(DiannToCurtainptmModalComponent)
              ref.result.then(async (result) => {
                await this.jobQueue.queue.createJob({type: 'curtain', data:{
                    pr_file_path: result.pr_file_path,
                    report_file_path: result.report_file_path,
                    modification_of_interests: result.modification_of_interests,
                    type: 'convert-diann-to-curtainptm'
                  }})
              })
            })
            break
          case 'convert-msfragger-to-curtainptm':
            zone.run(() => {
              const ref = this.modal.open(MsfraggerToCurtainptmModalComponent)
              ref.result.then(async (result) => {
                await this.jobQueue.queue.createJob({type: 'curtain', data:{
                    file_path: result.file_path,
                    index_col: result.index_col,
                    peptide_col: result.peptide_col,
                    fasta_file: result.fasta_file,
                    type: 'convert-msfragger-to-curtainptm'
                  }})
              })
            })
            break
        }
      })
      this.electronService.differentialAnalysisSubject.asObservable().subscribe((data) => {
        switch (data) {
          case 'limma':
            zone.run(() => {
              const ref = this.modal.open(LimmaModalComponent)
              ref.result.then(async (result) => {
                await this.jobQueue.queue.createJob({type: 'differential-analysis', data: {
                    input_file: result.input_file,
                    annotation_file: result.annotation_file,
                    index_col: result.index_col,
                    log2: result.log2,
                    comparisons: result.comparisons,
                    type: 'limma'
                  }})
              })
            })
            break
          case 'qfeatures-limma':
            zone.run(() => {
              const ref = this.modal.open(QfeaturesLimmaModalComponent)
              ref.result.then(async (result) => {
                await this.jobQueue.queue.createJob({type: 'differential-analysis', data: {
                  input_file: result.input_file,
                    annotation_file: result.annotation_file,
                    index_col: result.index_col,
                    log2: result.log2,
                    comparisons: result.comparisons,
                    normalization: result.normalization,
                    imputation: result.imputation,
                    rowFilter: result.rowFilter,
                    colFilter: result.colFilter,
                    aggregateColumn: result.aggregateColumn,
                    aggregateMethod: result.aggregateMethod,
                    type: 'qfeatures-limma'
                  }})
              })
            })
            break
        }
      })
      this.electronService.fileSubject.asObservable().subscribe((data) => {
        switch (data) {
          case 'create-annotation-file':
            zone.run(() => {
              const ref = this.modal.open(SampleAnnotationComponent)
              ref.componentInstance.mode = 'create'
              ref.result.then(async (data) => {
                this.electronService.remote.dialog.showSaveDialog({
                  title: 'Save Annotation File',
                  defaultPath: this.electronService.path.join(this.electronService.settings.resultStoragePath, 'annotation.txt'),
                  filters: [
                    {name: 'All Files', extensions: ['*']},
                    {name: 'text file', extensions: ['tsv', 'txt']},
                  ]
                }).then((result) => {
                  if (!result.canceled) {
                    const df = new DataFrame(data)
                    if (result.filePath) {
                      // @ts-ignore
                      this.electronService.fs.writeFile(result.filePath, df.toCSV({delimiter: '\t'}), (err) => {
                        if (err) {
                          console.error(err)
                        }
                      })
                    }
                  }
                })
              })
            })
            break
        }
      })

    } else {
      console.log('Run in browser');
    }
  }

  protected readonly Object = Object;
}
