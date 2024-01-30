import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {ElectronService} from "../core/services";
import {ToastService} from "../toast-container/toast.service";
import {DataFrame, fromCSV} from "data-forge";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {UniprotModalComponent} from "../uniprot-modal/uniprot-modal.component";
import * as worker_threads from "worker_threads";
import { JobQueueService } from '../job-queue/job-queue.service';
import {DiannCvModalComponent} from "../diann-cv-modal/diann-cv-modal.component";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, AfterViewInit {
  @ViewChild("fileZone") fileZone: ElementRef | undefined;

  clickedFile: any = null;
  checkState: boolean = false;
  showSidebar: boolean = true;
  sniffContent: string[] = []
  _previewTab: number = 0
  table = new DataFrame()
  tableArray: {[key: string]: any}[] = []
  columns: string[] = []

  set previewTab(value: number) {
    this._previewTab = value
    if (this._previewTab === 1) {

    }
  }

  get previewTab(): number {
    return this._previewTab
  }

  constructor(private modal: NgbModal, private zone: NgZone, private router: Router, public electronService: ElectronService, public toast: ToastService, private jobQueue: JobQueueService) {


    this.electronService.uniprotChannelSubject.asObservable().subscribe((data) => {
      console.log(data)
      if (data === "add") {
        this.zone.run(() => {
          const ref = this.modal.open(UniprotModalComponent, {scrollable: true})
          ref.componentInstance.columns = this.columns
          ref.componentInstance.fieldParameters = 'accession,id,gene_names,protein_name,organism_name,go_id,sequence'
          ref.result.then(async (result) => {
            await jobQueue.queue.createJob({type: 'uniprot-add', data: {data: this.table, columns: result.selectedUniProtColumns, from: result.from, to: result.to, file: this.clickedFile.path, uniprotColumn: result.column, type: 'Add UniProt Data to File'}})
          })
        })
      }
    })

    this.electronService.diannCVChannelSubject.asObservable().subscribe((data) => {
      this.zone.run(() => {
        const ref = this.modal.open(DiannCvModalComponent, {scrollable: true})
        ref.result.then(async (result) => {
          result['type'] = 'Generate Diann CV Plot from PR and/or PG Matrix files'
          await jobQueue.queue.createJob({type: "diann-cv", data: result})
        })
      })
    })

  }

  ngOnInit(): void {
    console.log('HomeComponent INIT');

  }

  ngAfterViewInit() {
    if (this.fileZone) {
      this.fileZone.nativeElement.addEventListener("drop", (e:DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        //for (const f of e.dataTransfer?.files) {
        //  this.files.push(f.path)
        //}
        //check if transferring folder

        if (e.dataTransfer?.items) {
          // @ts-ignore
          for (const item of e.dataTransfer?.items) {
            if (item.kind === 'file') {

              const file = item.webkitGetAsEntry();
              if (file) {
                this.recursiveReadDir(file, file.fullPath)
              }
            }
          }
        }
      })
      this.fileZone.nativeElement.addEventListener("dragover", (e:DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      })
      this.fileZone.nativeElement.addEventListener("dragenter", (e:DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      })
    }
  }

  openDialog() {
    this.electronService.openDialog().then((files: any) => {
      for (const filePath of files.filePaths) {
        const buffer = this.electronService.fs.readFileSync(filePath)
        const arrayData = buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)
        const fileName = this.electronService.path.basename(filePath)
        const file = new File([arrayData], fileName)
        if (file.name.endsWith(".tsv") || file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
          this.electronService.files.push({checked: false, file: file, path: filePath, name: fileName, isTabular: true, isFasta: false})
        } else if (file.name.endsWith(".fa") || file.name.endsWith(".fasta")) {
          this.electronService.files.push({checked: false, file: file, path: filePath, name: fileName, isTabular: false, isFasta: true})
        }
      }
    })
  }

  recursiveReadDir(file: any, path: string) {
    if (file.isDirectory) {
      const reader = file.createReader();
      reader.readEntries((entries: any) => {
        for (const entry of entries) {
          this.recursiveReadDir(entry, entry.fullPath)
        }
      })
    } else if (file.isFile) {
      this.getFileObject(file).then((f: any) => {
        if (file.name.endsWith(".tsv") || file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
          this.zone.run(() => {
            console.log(f)
            this.electronService.files.push({checked: false, file: f, path: f.path, name: file.name, isTabular: true, isFasta: false})
          })

        } else if (file.name.endsWith(".fa") || file.name.endsWith(".fasta")) {

          this.zone.run(() => {
            this.electronService.files.push({checked: false, file: f, path: f.path, name: file.name, isTabular: false, isFasta: true})
          })
        }
      })

    }
  }

  handleFileClick(f: any) {
    if (this.clickedFile === f) {
      this.clickedFile = f
      this.sniffContent = []
      this.previewTab = 0
      this.table = new DataFrame()
    } else {
      this.clickedFile = f
      if (f.isTabular) {
        this.electronService.sniffFile(f.file).then((data: any) => {
          this.sniffContent = data.result
          this.table = fromCSV(this.sniffContent.join("\n"))
          this.columns = this.table.getColumnNames()
          this.tableArray = this.table.toArray()
        })
      }
    }

  }

  removeChecked(){
    this.electronService.files = this.electronService.files.filter((f) => {
      return !f.checked
    })
  }

  handleStateChange() {
    this.checkState = !this.checkState
  }

  async getFileObject(file: FileSystemEntry) {
    // @ts-ignore
    return await new Promise((resolve, reject) => file.file(resolve, reject))
  }
}
