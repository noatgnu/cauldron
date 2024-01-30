import {Injectable, NgZone} from '@angular/core';
import {ElectronService} from "../core/services";
import {Job, Queue} from "embedded-queue";
import {Accession, Parser} from "uniprotparserjs";
import {DataFrame, fromCSV, IDataFrame, ISeries, Series} from "data-forge";
import {ToastService} from "../toast-container/toast.service";


@Injectable({
  providedIn: 'root'
})
export class JobQueueService {
  queue!: Queue;
  jobMap: {[key: string]: {completed: boolean, job: Job, error: boolean}} = {}
  processingCount = 0
  completedCount = 0
  errorCount: number = 0
  settings = this.electronService.settings;
  constructor(private electronService: ElectronService, private toastService: ToastService, private zone: NgZone) {
    this.createJobQueue().then(() => {
      console.log("Job Queue Created")
    })
  }

  async createJobQueue() {
    const queue = await this.electronService.embeddedQueue.Queue.createQueue({
      inMemoryOnly: true
    })
    queue.on(
      this.electronService.embeddedQueue.Event.Error, (error: any) => {
        console.log(error)
      }
    )
    queue.on(
      this.electronService.embeddedQueue.Event.Failure, (job: Job, error: any) => {
        console.log("Job Failed")
        console.log("Job ID: "+job.id)
        console.log("Job Type: "+job.type)
        this.jobMap[job.id] = {completed: false, job: job, error: true}
        this.processingCount--
        this.errorCount++
        this.toastService.show("Job Failed", `Job ID: ${job.id}. Job Type: ${job.type}`)
      }
    )
    queue.on(
      this.electronService.embeddedQueue.Event.Complete, (job: Job, result: any) => {
        this.zone.run(() => {
          console.log("Job Complete")
          console.log("Job ID: "+job.id)
          console.log("Job Type: "+job.type)
          this.jobMap[job.id] = {completed: true, job: job, error: false}
          this.processingCount--
          this.completedCount++
          this.toastService.show("Job Complete", `Job ID: ${job.id}. Job Type: ${job.type}`)
        })
      }
    )
    queue.on(
      this.electronService.embeddedQueue.Event.Start, (job: Job) => {
        console.log("Job Started")
        console.log("Job ID: "+job.id)
        console.log("Job Type: "+job.type)
        this.jobMap[job.id] = {completed: false, job: job, error: false}
        this.processingCount++
        this.toastService.show("Job Started", `Job ID: ${job.id}. Job Type: ${job.type}`)
      }
    )
    await this.setupUniProtJobQueue(queue)
    await this.setupDiannCVJobQueue(queue)
    this.queue = queue
  }

  async setupUniProtJobQueue(queue: Queue) {
    queue.process("uniprot-add", async (job: Job) => {
      await job.setProgress(0, 100)
      const data: any = job.data as {data: any, columns: string[], from: string, to: string, file: string, uniprotColumn: string, type: string}
      let started = false
      let uniprotColumnIndex = -1
      let uniprotIDs: string[] = []
      let delimiter = ","
      if (data.file.endsWith(".txt") || data.file.endsWith(".tsv")) {
        delimiter = "\t"
      }
      for (const line of this.electronService.readTextFileLineByLine(data.file)) {
        let lineData: string[] = line.split(delimiter)
        if (started) {
          uniprotIDs.push(lineData[uniprotColumnIndex])
        } else {
          uniprotColumnIndex = lineData.indexOf(data.uniprotColumn)
          started = true
        }
      }
      await job.setProgress(10, 100)

      const jobData = uniprotIDs.map((id: string) => {
        const acc = new Accession(id, true)
        if (acc.acc !== "") {
          return acc.toString()
        } else{
          return id
        }
      })
      await job.setProgress(20, 100)
      const distinctIDs = new Series(jobData).distinct().toArray()
      const parser = new Parser(5, data.columns.join(","), "tsv", false, data.from)
      const dataMap: Map<string, ISeries<number, any>> = new Map<string, ISeries<number, any>>()
      let extraCols: string[] = []
      for await(const result of parser.parse(distinctIDs, 500)) {
        const res: IDataFrame<number, any> = fromCSV(result.data)
        if (extraCols.length === 0) {
          extraCols = res.getColumnNames()
        }
        for (const row of res) {
          dataMap.set(row["From"], row)
        }
      }
      await job.setProgress(70, 100)
      const newFile = this.electronService.fs.openSync([this.electronService.settings.resultStoragePath, "uniprot.tsv"].join(this.electronService.path.sep), 'w')
      let n = 0;
      started = false
      for (const line of this.electronService.readTextFileLineByLine(data.file)) {
        let lineData: string[] = line.split(delimiter)
        if (started) {
          uniprotIDs.push(lineData[uniprotColumnIndex])
        } else {
          uniprotColumnIndex = lineData.indexOf(data.uniprotColumn)
          lineData = lineData.concat(extraCols)
          started = true
        }
        if (n > 0) {
          try {
            const uniprot = dataMap.get(jobData[n-1])
            if (uniprot !== undefined) {
              for (const i of extraCols) {
                // @ts-ignore
                lineData.push(uniprot[i])
              }
            }
          }catch (e) {
            console.log(e)
          }
        }
        this.electronService.fs.appendFileSync(newFile, lineData.join("\t")+"\n")
        n++
      }
      this.electronService.fs.closeSync(newFile)
      await job.setProgress(100, 100)
      console.log("Finished UniProt Job")
    }, 1)
  }

  async setupDiannCVJobQueue(queue: Queue) {
    queue.process("diann-cv", async (job: Job) => {
      const data = job.data as {pr_matrix_file: string, pg_matrix_file: string, log_file: string, sample_annotations: string, annotation_file: string, samples: string}
      const options = Object.assign({}, this.electronService.pythonOptions)
      options.args = ["--report_pr_file_path", data.pr_matrix_file, "--report_pg_file_path", data.pg_matrix_file, "--log_file_path", data.log_file, "--annotation_file", data.annotation_file, "--output_file", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep)]
      await job.setProgress(0, 100)
      const result =  await this.electronService.pythonShell.run([
        this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
        "scripts",
        "cv.py"
      ].join(this.electronService.path.sep), options)
      await job.setProgress(100, 100)
    }, 1)

  }

  async shutdown() {
    await this.queue.shutdown(1000)
  }
}
