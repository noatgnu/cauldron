import {Injectable, NgZone} from '@angular/core';
import {ElectronService} from "../core/services";
import {Job, Queue} from "embedded-queue";
import {Accession, Parser} from "uniprotparserjs";
import {DataFrame, fromCSV, IDataFrame, ISeries, Series} from "data-forge";
import {ToastService} from "../toast-container/toast.service";
import {Subject} from "rxjs";


@Injectable({
  providedIn: 'root'
})
export class JobQueueService {
  queue!: Queue;
  jobMap: {[key: string]: {completed: boolean, job: Job, error: boolean, type: string, name?: string}} = {}
  previousJobMap: {[key: string]: {completed: boolean, job: any, error: boolean, type: string, name?: string}} = {}
  jobQueueUpdateSubject: Subject<boolean> = new Subject<boolean>()
  processingCount = 0
  completedCount = 0
  errorCount: number = 0
  settings = this.electronService.settings;
  constructor(private electronService: ElectronService, private toastService: ToastService, private zone: NgZone) {
    this.createJobQueue().then(() => {
      console.log("Job Queue Created")
      this.previousJobMap = this.electronService.loadJobQueue()
      console.log(this.previousJobMap)
    })
    this.electronService.closeSubject.asObservable().subscribe((value: boolean) => {
      this.saveJobQueue()
    })
    this.electronService.shutdownSubject.asObservable().subscribe((value: string) => {
      if (value === 'shutdown') {
        this.shutdown().then(() => {
          this.electronService.ipcRenderer.send("shutdown-complete", "shutdown-complete")
        })
      }
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
        this.zone.run(() => {
          console.log(error)
          console.log("Job Failed")
          console.log("Job ID: "+job.id)
          console.log("Job Type: "+job.type)
          // @ts-ignore
          this.jobMap[job.id] = {completed: false, job: job, error: true, type: job.data.type}
          this.processingCount--
          this.errorCount++
          this.toastService.show("Job Failed", `Job ID: ${job.id}. Job Type: ${job.type}`)
          this.jobQueueUpdateSubject.next(true)
        })

      }
    )
    queue.on(
      this.electronService.embeddedQueue.Event.Complete, (job: Job, result: any) => {
        this.zone.run(() => {
          console.log("Job Complete")
          console.log("Job ID: "+job.id)
          console.log("Job Type: "+job.type)
          // @ts-ignore
          this.jobMap[job.id] = {completed: true, job: job, error: false, type: job.data.type}
          this.processingCount--
          this.completedCount++
          this.toastService.show("Job Complete", `Job ID: ${job.id}. Job Type: ${job.type}`)
          this.jobQueueUpdateSubject.next(true)

        })
      }
    )
    queue.on(
      this.electronService.embeddedQueue.Event.Start, (job: Job) => {
        this.zone.run(() => {

          console.log("Job Started")
          console.log("Job ID: "+job.id)
          console.log("Job Type: "+job.type)
          // @ts-ignore
          this.jobMap[job.id] = {completed: false, job: job, error: false, type: job.data.type}
          this.jobMap[job.id].name = "Untitled job"
          const result = this.electronService.fs.mkdirSync(this.electronService.path.join(this.electronService.settings.resultStoragePath, job.id), {recursive: true})
          const data = JSON.stringify(job.data)
          this.electronService.fs.writeFileSync(this.electronService.path.join(this.electronService.settings.resultStoragePath, job.id, "job_data.json"), data)
          this.processingCount++
          this.toastService.show("Job Started", `Job ID: ${job.id}. Job Type: ${job.type}`)
          this.jobQueueUpdateSubject.next(true)
        })
      }
    )
    await this.setupUniProtJobQueue(queue)
    await this.setupDiannCVJobQueue(queue)
    await this.setupDataTransformationJobQueue(queue)
    await this.setupCitationUtilityJobQueue(queue)
    await this.setupDimensionalityReductionJobQueue(queue)
    await this.setupCurtainJobQueue(queue)
    await this.setupDiffentialAnalysisJobQueue(queue)
    await this.setupStatisticalTestsJobQueue(queue)
    await this.setupUtilityJobQueue(queue)
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
      console.log(options.args)
      await job.setProgress(50, 100)
      const result =  await this.electronService.pythonShell.run([
        this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
        "scripts",
        "cv.py"
      ].join(this.electronService.path.sep), options)
      await job.setProgress(100, 100)
    }, 1)

  }

  async setupDataTransformationJobQueue(queue: Queue) {
    queue.process("data-transformation", async (job: Job) => {
      let data = job.data
      const options = Object.assign({}, this.electronService.pythonOptions)
      // @ts-ignore
      switch (data.type) {
        case "impute-missing-values":

          const payload = data as {file_path: string, method: string, k: number, strategy: string, fillValue: number, iterations: number, columns: string[]}
          options.args = [
            "--file_path", payload.file_path,
            "--imputer_type", payload.method,
            "--n_neighbors", payload.k.toString(),
            "--simple_strategy", payload.strategy,
            "--fill_value", payload.fillValue.toString(),
            "--max_iter", payload.iterations.toString(),
            "--columns_name", payload.columns.join(","),
            "--output_file", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep)
          ]
          console.log(options.args)
          await job.setProgress(50, 100)
          const result =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "imputation.py"
          ].join(this.electronService.path.sep), options)

          await job.setProgress(100, 100)
          break
        case "normalize-data":
          const payload_normal = data as {file_path: string, columns_name: string[], scaler_type: string, with_centering: boolean, with_scaling: boolean, n_quantiles: number, output_distribution: string, norm: string, power_method: string}
          options.args = [
            "--file_path", payload_normal.file_path,
            "--columns_name", payload_normal.columns_name.join(","),
            "--scaler_type", payload_normal.scaler_type,
            "--with_centering", payload_normal.with_centering.toString(),
            "--with_scaling", payload_normal.with_scaling.toString(),
            "--n_quantiles", payload_normal.n_quantiles.toString(),
            "--output_distribution", payload_normal.output_distribution,
            "--norm", payload_normal.norm,
            "--power_method", payload_normal.power_method,
            "--output_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep)
          ]
          console.log(options.args)
          await job.setProgress(50, 100)

          const result_normal =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "normalization.py"
          ].join(this.electronService.path.sep), options)

          await job.setProgress(100, 100)
      }
    }, 1)
  }

  async setupCitationUtilityJobQueue(queue: Queue) {
    queue.process("citation-utility", async (job: Job) => {
      const data = job.data
      // @ts-ignore
      switch (data.type) {
        case "generate-ris-citation":
          const options = Object.assign({}, this.electronService.pythonOptions)
          const payload = data as {idList: string, type: string}
          options.args = [
            "--ids", payload.idList,
            "--output_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep)
          ]
          console.log(options.args)
          await job.setProgress(50, 100)
          const result =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "protocolsio.py"
          ].join(this.electronService.path.sep), options)
          await job.setProgress(100, 100)
          break
      }
    }, 1)
  }

  async setupDimensionalityReductionJobQueue(queue: Queue) {
    queue.process("dimensionality-reduction", async (job: Job) => {
      const data = job.data
      // @ts-ignore
      switch (data.type) {
        case "phate":
          const options = Object.assign({}, this.electronService.pythonOptions)
          const payload = data as {input_file: string, columns_name: string[], n_components: number, type: string, log2: boolean}
          options.args = [
            "--input_file", payload.input_file,
            "--columns_name", payload.columns_name.join(","),
            "--n_components", payload.n_components.toString(),
            "--log2", payload.log2.toString(),
            "--output_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep)
          ]
          console.log(options.args)
          await job.setProgress(50, 100)
          const result =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "phate_analysis.py"
          ].join(this.electronService.path.sep), options)
          await job.setProgress(100, 100)
          break
        case "pca":
          const options_pca = Object.assign({}, this.electronService.pythonOptions)
          const payload_pca = data as {input_file: string, columns_name: string[], n_components: number, type: string, log2: boolean}
          options_pca.args = [
            "--input_file", payload_pca.input_file,
            "--columns_name", payload_pca.columns_name.join(","),
            "--n_components", payload_pca.n_components.toString(),
            "--log2", payload_pca.log2.toString(),
            "--output_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep)
          ]
          console.log(options_pca.args)
          await job.setProgress(50, 100)
          const result_pca =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "pca.py"
          ].join(this.electronService.path.sep), options_pca)
          await job.setProgress(100, 100)
          break
        case "correlation-matrix":
          const options_cm = Object.assign({}, this.electronService.pythonOptions)
          const payload_cm = data as {file_path: string, sample_cols: string[], index_col: string, method: string, min_value?: number, order?: string, hclust_method: string, presenting_method: string, cor_shape: string, plot_only: string, type: string}
          options_cm.args = [
            "--file_path", payload_cm.file_path,
            "--sample_cols", payload_cm.sample_cols.join(","),
            "--index_col", payload_cm.index_col,
            "--method", payload_cm.method,
            "--hclust_method", payload_cm.hclust_method,
            "--presenting_method", payload_cm.presenting_method,
            "--cor_shape", payload_cm.cor_shape,
            "--output_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep),
            "--r_home", this.electronService.RPath.replace(this.electronService.path.sep+ ["bin", "R.exe"].join(this.electronService.path.sep), "")
          ]

          if (payload_cm.min_value) {
            options_cm.args.push("--min_value")
            options_cm.args.push(payload_cm.min_value.toString())
          }
          if (payload_cm.order) {
            options_cm.args.push("--order")
            options_cm.args.push(payload_cm.order)
          }
          if (payload_cm.plot_only) {
            options_cm.args.push("--plot_only")
          }

          await job.setProgress(50, 100)
          const result_cm =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "correlation_matrix.py"
          ].join(this.electronService.path.sep), options_cm)

          await job.setProgress(100, 100)
          break
        case "fuzzy-clustering-pca":
          const options_fcm_pca = Object.assign({}, this.electronService.pythonOptions)
          const payload_fcm_pca = data as {file_path: string, annotation_path: string, center_count: number[], type: string}
          options_fcm_pca.args = [
            "--file_path", payload_fcm_pca.file_path,
            "--annotation_path", payload_fcm_pca.annotation_path,
            "--center_count", payload_fcm_pca.center_count.join(","),
            "--output_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep)
          ]

          await job.setProgress(50, 100)
          const result_fcm_pca =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "fuzz_clustering.py"
          ].join(this.electronService.path.sep), options_fcm_pca)

          await job.setProgress(100, 100)
          break
      }
    }, 1)
  }

  async setupCurtainJobQueue(queue: Queue) {
    queue.process("curtain", async (job: Job) => {
      const data = job.data
      // @ts-ignore
      switch (data.type) {
        case "convert-diann-to-curtainptm":
          const options = Object.assign({}, this.electronService.pythonOptions)
          const payload = data as {pr_file_path: string, report_file_path: string, modification_of_interests: string, type: string}
          options.args = [
            "--pr_file_path", payload.pr_file_path,
            "--report_file_path", payload.report_file_path,
            "--modification_of_interests", payload.modification_of_interests,
            "--output_file", [this.electronService.settings.resultStoragePath, job.id, "for_curtainptm.txt"].join(this.electronService.path.sep)
          ]
          console.log(options.args)
          await job.setProgress(50, 100)
          let bin = "diann-curtainptm"
          if (this.electronService.translatedPlatform === 'win') {
            bin = "diann-curtainptm.exe"
          }
          const result =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "bin",
            this.electronService.translatedPlatform,
            "python",
            "Scripts",
            bin
          ].join(this.electronService.path.sep), options)

          await job.setProgress(100, 100)
          break
        case "convert-msfragger-to-curtainptm":
          const options_ms = Object.assign({}, this.electronService.pythonOptions)
          const payload_ms = data as {file_path: string, index_col: string, peptide_col: string, fasta_file: string, type: string}

          options_ms.args = [
            "--file_path", payload_ms.file_path,
            "--index_col", payload_ms.index_col,
            "--peptide_col", payload_ms.peptide_col,
            "--output_file", [this.electronService.settings.resultStoragePath, job.id, "for_curtainptm.txt"].join(this.electronService.path.sep)
          ]

          if (payload_ms.fasta_file !== "" && payload_ms.fasta_file !== null) {
            options_ms.args.push("--fasta_file")
            options_ms.args.push(payload_ms.fasta_file)
          }

          let bin_msf = "msf-curtainptm"
          if (this.electronService.translatedPlatform === 'win') {
            bin_msf = "msf-curtainptm.exe"
          }

          await job.setProgress(50, 100)
          const result_ms =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "bin",
            this.electronService.translatedPlatform,
            "python",
            "Scripts",
            bin_msf
          ].join(this.electronService.path.sep), options_ms)
          await job.setProgress(100, 100)
          break
      }
    }, 1)
  }

  async setupDiffentialAnalysisJobQueue(queue: Queue) {
    queue.process("differential-analysis", async (job: Job) => {
      const data = job.data
      // @ts-ignore
      switch (data.type) {
        case "limma":
          const options = Object.assign({}, this.electronService.pythonOptions)
          const payload = data as {input_file: string, annotation_file: string, index_col: string[], log2: boolean, comparisons: {condition_A: string, condition_B: string, comparison_label: string}[], type: string}
          this.electronService.fs.mkdirSync([this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep), {recursive: true})
          // write comparison_file

          const comparisonFile = new DataFrame(payload.comparisons)
          // @ts-ignore
          this.electronService.fs.writeFileSync([this.electronService.settings.resultStoragePath, job.id, "comparison.txt"].join(this.electronService.path.sep), comparisonFile.toCSV({delimiter: "\t"}))

          options.args = [
            "--input_file", payload.input_file,
            "--annotation_file", payload.annotation_file,
            "--index_col", payload.index_col.join(","),
            "--comparison_file", [this.electronService.settings.resultStoragePath, job.id, "comparison.txt"].join(this.electronService.path.sep),
            "--output_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep),
            "--r_home", this.electronService.RPath.replace(this.electronService.path.sep+ ["bin", "R.exe"].join(this.electronService.path.sep), "")
          ]
          if (payload.log2) {
            options.args.push("--log2")
          }


          console.log(options.args)
          await job.setProgress(50, 100)

          const result =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "differential_analysis.py"
          ].join(this.electronService.path.sep), options)


          await job.setProgress(100, 100)
          break
        case "qfeatures-limma":
          const options_qf = Object.assign({}, this.electronService.pythonOptions)
          const payload_qf = data as {input_file: string, annotation_file: string, index_col: string[], log2: boolean, rowFilter: number, colFilter: number, imputation: string, normalization: string, aggregateMethod: string, aggregateColumn: string, comparisons: {condition_A: string, condition_B: string, comparison_label: string}[], type: string}
          this.electronService.fs.mkdirSync([this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep), {recursive: true})
          // write comparison_file

          const comparisonFile_qf = new DataFrame(payload_qf.comparisons)
          // @ts-ignore
          this.electronService.fs.writeFileSync([this.electronService.settings.resultStoragePath, job.id, "comparison.txt"].join(this.electronService.path.sep), comparisonFile_qf.toCSV({delimiter: "\t"}))

          options_qf.args = [
            "--input_file", payload_qf.input_file,
            "--annotation_file", payload_qf.annotation_file,
            "--index_col", payload_qf.index_col.join(","),
            "--comparison_file", [this.electronService.settings.resultStoragePath, job.id, "comparison.txt"].join(this.electronService.path.sep),
            "--output_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep),
            "--r_home", this.electronService.RPath.replace(this.electronService.path.sep+ ["bin", "R.exe"].join(this.electronService.path.sep), ""),
            "--row_filter", payload_qf.rowFilter.toString(),
            "--col_filter", payload_qf.colFilter.toString(),
            "--impute", payload_qf.imputation,
            "--normalize", payload_qf.normalization,
          ]
          if (payload_qf.log2) {
            options_qf.args.push("--log2")
          }
          if (payload_qf.aggregateColumn) {
            options_qf.args.push("--aggregate_column")
            options_qf.args.push(payload_qf.aggregateColumn)
          }
          if (payload_qf.aggregateMethod) {
            options_qf.args.push("--aggregate_method")
            options_qf.args.push(payload_qf.aggregateMethod)
          }
          console.log(options_qf.args)
          await job.setProgress(50, 100)

          const result_qf =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "differential_analysis.py"
          ].join(this.electronService.path.sep), options_qf)
      }
    }, 1)
  }
  async setupStatisticalTestsJobQueue(queue: Queue) {
    queue.process("statistical-tests", async (job: Job) => {
      const data = job.data
      // @ts-ignore
      switch (data.type) {
        case "estimation-plot":
          const options = Object.assign({}, this.electronService.pythonOptions)
          const payload = data as {input_file: string, annotation_file: string, index_col: string, log2: boolean, condition_order: string[], selected_protein: string, type: string}
          this.electronService.fs.mkdirSync([this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep), {recursive: true})
          options.args = [
            "--file_path", payload.input_file,
            "--sample_annotation", payload.annotation_file,
            "--index_col", payload.index_col,
            "--out_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep),
            "--selected_protein", payload.selected_protein,
            "--condition_order", payload.condition_order.join(",")
          ]
          if (payload.log2) {
            options.args.push("--log2")
          }
          console.log(options.args)
          await job.setProgress(50, 100)

          const result =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "estimation_plot.py"
          ].join(this.electronService.path.sep), options)

          await job.setProgress(100, 100)
          break

      }
    }, 1)
  }

  async setupUtilityJobQueue(queue: Queue) {
    queue.process("utilities", async (job: Job) =>  {
      const data = job.data
      // @ts-ignore
      switch (data.type) {
        case "check-peptide-in-library":
          const options = Object.assign({}, this.electronService.pythonOptions)
          const payload =  data as {fasta_file: string, peptide_column: string, file_path: string, min_length: number, miss_cleavage: number, type: string}
          options.args = [
            "--fasta_file", payload.fasta_file,
            "--peptide_column", payload.peptide_column,
            "--file_path", payload.file_path,
            "--min_length", payload.min_length.toString(),
            "--miss_cleavage", payload.miss_cleavage.toString(),
            "--output_folder", [this.electronService.settings.resultStoragePath, job.id].join(this.electronService.path.sep)
          ]

          console.log(options.args)

          await job.setProgress(50, 100)
          const result =  await this.electronService.pythonShell.run([
            this.electronService.resourcePath.replace(this.electronService.path.sep+ "app.asar", ""),
            "scripts",
            "library_check_peptide.py"
          ].join(this.electronService.path.sep), options)
          await job.setProgress(100, 100)

      }
    }, 1)
  }

  async shutdown() {
    await this.queue.shutdown(1000)
  }

  saveJobQueue() {
    this.electronService.saveJobQueue(this.jobMap)
  }
}
