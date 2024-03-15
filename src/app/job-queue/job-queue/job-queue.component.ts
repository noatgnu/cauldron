import {Component, NgZone} from '@angular/core';
import {DataStorageSettingsComponent} from "../../settings/data-storage-settings/data-storage-settings.component";
import {ElectronService} from "../../core/services";
import {JobQueueService} from "../job-queue.service";
import {Job} from "embedded-queue";
import {NgClass} from "@angular/common";
import {NgbModal, NgbProgressbar} from "@ng-bootstrap/ng-bootstrap";
import {PcaPlotModalComponent} from "../../modals/pca-plot-modal/pca-plot-modal.component";
import {PhatePlotModalComponent} from "../../modals/phate-plot-modal/phate-plot-modal.component";
import {SampleAnnotationComponent} from "../../modals/sample-annotation/sample-annotation.component";
import {DataFrame, IDataFrame} from "data-forge";
import {FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule} from "@angular/forms";
import {JobRemovalModalComponent} from "../../modals/job-removal-modal/job-removal-modal.component";
import {VolcanoPlotModalComponent} from "../../modals/volcano-plot-modal/volcano-plot-modal.component";
import {
  FuzzyClusteringPcaPlotComponent
} from "../../plots/fuzzy-clustering-pca-plot/fuzzy-clustering-pca-plot.component";
import {
  FuzzyClusteringPlotModalComponent
} from "../../modals/fuzzy-clustering-plot-modal/fuzzy-clustering-plot-modal.component";

@Component({
  selector: 'app-job-queue',
  standalone: true,
  imports: [
    DataStorageSettingsComponent,
    NgClass,
    NgbProgressbar,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './job-queue.component.html',
  styleUrl: './job-queue.component.scss'
})
export class JobQueueComponent {
  jobMap: {[key: string]: {completed: boolean, job: Job, error: boolean, type: string, name?: string}} = {}
  previousJobMap: {[key: string]: {completed: boolean, job: any, error: boolean, type: string, name?: string}} = {}
  clickedJob: {completed: boolean, job: any, error: boolean, type: string, name?: string} | undefined;
  settings = this.electronService.settings;
  _queueName: "previous"|"current" = "current"
  set queueName(value: "previous"|"current") {
    this._queueName = value
    if (value === "previous") {
      if (Object.keys(this.jobQueue.previousJobMap).length !== 0) {
        this.previousJobMap = this.jobQueue.previousJobMap
      }
      this.displayJob = Object.values(this.previousJobMap).reverse()
    } else {
      this.displayJob = Object.values(this.jobMap).reverse()
    }
  }
  get queueName() {
    return this._queueName
  }
  sampleAnnotation: IDataFrame<number, {Sample: string, Condition: string}> = new DataFrame()

  form: FormGroup = this.fb.group({
    jobSearch: new FormControl("")
  })

  displayJob: {completed: boolean, job: any, error: boolean, type: string, name?: string}[] = []

  constructor(private zone: NgZone, private jobQueue: JobQueueService, private electronService: ElectronService, private modal : NgbModal, private fb: FormBuilder) {
    console.log(this.form)
    this.jobMap = this.jobQueue.jobMap
    this.previousJobMap = this.jobQueue.previousJobMap

    this.displayJob = Object.values(this.jobMap).reverse()
    this.form.controls['jobSearch'].valueChanges.subscribe((value: string) => {
      this.jobSearch(value)
    })
    this.jobQueue.jobQueueUpdateSubject.asObservable().subscribe((value: boolean) => {
      if (this.queueName === "previous") {
        this.displayJob = Object.values(this.previousJobMap).reverse()
      } else {
        this.displayJob = Object.values(this.jobMap).reverse()
      }

    })
  }

  getJobData(job: any){
    if ("data" in job.job) {
      return job.job.data as any
    } else {
      return job.job
    }

  }

  openFileExplorerAt(id: string) {
    this.electronService.remote.shell.openPath(this.settings.resultStoragePath+this.electronService.path.sep+id).then(() => {

    })
  }

  getJobStatus(job: Job) {
    if (this.queueName === "current") {
      return this.jobMap[job.id].completed
    } else {
      return this.previousJobMap[job.id].completed
    }

  }

  openPCAPlot() {
    // @ts-ignore
    const file_path = this.electronService.path.join( this.settings.resultStoragePath, this.clickedJob.job.id)
    const ref = this.modal.open(PcaPlotModalComponent, {scrollable: true, size: 'xl'})
    ref.componentInstance.annotation = this.sampleAnnotation
    ref.componentInstance.jsonFile = this.electronService.path.join(file_path, 'explained_variance_ratio.json')
    ref.componentInstance.txtFile = this.electronService.path.join(file_path, 'pca_output.txt')
    if (this.clickedJob){
      ref.componentInstance.jobId = this.clickedJob.job.id
    }
  }

  openPHATEPlot() {
    // @ts-ignore
    const file_path = this.electronService.path.join( this.settings.resultStoragePath, this.clickedJob.job.id)
    const ref = this.modal.open(PhatePlotModalComponent, {scrollable: true, size: 'xl'})
    ref.componentInstance.annotation = this.sampleAnnotation
    ref.componentInstance.txtFile = this.electronService.path.join(file_path, 'phate_output.txt')
    if (this.clickedJob){
      ref.componentInstance.jobId = this.clickedJob.job.id
    }


  }

  handleJobClick(job: {completed: boolean, job: any, error: boolean, type: string, name?: string}) {
    this.clickedJob = job
    if (!job.name) {
      job.name = "Untitled job"
    }

    this.electronService.fs.exists(this.electronService.path.join(this.settings.resultStoragePath, job.job.id, 'annotation.txt'), (exists: boolean) => {
      console.log(job)

      if (exists && this.clickedJob && job.completed) {
        this.sampleAnnotation = this.electronService.dataForgeFS.readFileSync(this.electronService.path.join(this.settings.resultStoragePath, job.job.id, 'annotation.txt')).parseCSV()
        console.log(this.sampleAnnotation)
      }
    })
  }
  openAnnotationModal() {

    if (this.clickedJob) {
      const ref = this.modal.open(SampleAnnotationComponent, {scrollable: true, size: 'xl'})
      ref.componentInstance.mode = 'create'
      ref.componentInstance.annotation = this.sampleAnnotation
      ref.result.then((result: any[]) => {
        this.sampleAnnotation = new DataFrame(result)
        if (this.clickedJob) {
          // @ts-ignore
          this.electronService.fs.writeFileSync(this.electronService.path.join(this.settings.resultStoragePath, this.clickedJob.job.id, 'annotation.txt'), this.sampleAnnotation.toCSV({delimiter: '\t'}))
        }
      })
    }
  }

  jobSearch(value: string) {
    let jobMap: {[key: string]: {completed: boolean, job: any, error: boolean, type: string, name?: string}} = {}
    if (this.queueName === "current") {
      jobMap = this.jobMap
    } else {
      jobMap = this.previousJobMap
    }
    if (value) {
      this.displayJob = Object.values(jobMap).filter((job: any) => {
        if (job.name) {
          return job.name.indexOf(value) !== -1
        } else if (job.type) {
          return job.type.indexOf(value) !== -1
        }
        return job.job.id.indexOf(value) !== -1
      }).reverse()
    } else {
      this.displayJob = Object.values(jobMap).reverse()
    }
  }

  remove() {
    if (this.clickedJob) {
      const jobId = this.clickedJob.job.id

      const ref = this.modal.open(JobRemovalModalComponent)
      ref.closed.subscribe((result: boolean) => {
        if (result) {
          this.clickedJob = undefined
          // @ts-ignore
          this.displayJob = this.displayJob.filter((job) => job.job.id !== jobId)
          // @ts-ignore
          const folder = this.electronService.path.join(this.settings.resultStoragePath, jobId)
          this.electronService.fs.rmdirSync(folder, {recursive: true})
          if (this.queueName === "current") {
            // @ts-ignore
            delete this.jobMap[jobId]
          } else {
            // @ts-ignore
            delete this.previousJobMap[jobId]
          }
          this.electronService.saveJobQueue(this.jobMap)
        }
      })

    }
  }

  openVolcanoPlotModal() {
    if (this.clickedJob) {
      if (this.clickedJob.type === 'limma') {
        const ref = this.modal.open(VolcanoPlotModalComponent, {scrollable: true, size: 'xl'})
        const jobFolder = this.electronService.path.join(this.settings.resultStoragePath, this.clickedJob.job.id)
        const jobData = JSON.parse(this.electronService.fs.readFileSync(this.electronService.path.join(jobFolder, 'job_data.json')).toString())
        ref.componentInstance.indexCols = jobData.index_col
        ref.componentInstance.differentialAnalysisFile = this.electronService.path.join(jobFolder, 'differential_analysis.txt')
      }
    }
  }

  openFuzzyClusteringPCAPlot() {
    if (this.clickedJob) {
      if (this.clickedJob.type === 'fuzzy-clustering-pca') {
        const ref = this.modal.open(FuzzyClusteringPlotModalComponent, {scrollable: true, size: 'xl'})
        const jobFolder = this.electronService.path.join(this.settings.resultStoragePath, this.clickedJob.job.id)
        const jobData = JSON.parse(this.electronService.fs.readFileSync(this.electronService.path.join(jobFolder, 'job_data.json')).toString())
        const explainedVariance = JSON.parse(this.electronService.fs.readFileSync(this.electronService.path.join(jobFolder, 'explained_variance_ratio.json')).toString())
        const filePathList: string[] = []
        // check if file exists
        for (const c of jobData["center_count"]) {
          const file = this.electronService.path.join(jobFolder, `fcm_${c}_clusters.txt`)
          if (this.electronService.fs.existsSync(file)) {
            filePathList.push(file)
          }
        }
        console.log(filePathList)
        ref.componentInstance.filePathList = filePathList
        ref.componentInstance.explainedVariance = explainedVariance
      }
    }
  }
  protected readonly Object = Object;
}
