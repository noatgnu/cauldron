import {AfterViewInit, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import { Router } from '@angular/router';
import {DataFrame, fromCSV} from "data-forge";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import {ElectronService} from "../core/services";
import {ToastService} from "../toast-container/toast.service";
import {JobQueueService} from "../job-queue/job-queue.service";
import {UniprotModalComponent} from "../modals/uniprot-modal/uniprot-modal.component";
import {DiannCvModalComponent} from "../modals/diann-cv-modal/diann-cv-modal.component";

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
      console.log(this.tableArray)
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
          }).catch((err) => {
            console.log(err)
          })
        })
      }
    })

    this.electronService.diannCVChannelSubject.asObservable().subscribe(() => {
      this.zone.run(() => {
        const ref = this.modal.open(DiannCvModalComponent, {scrollable: true})
        ref.result.then(async (result) => {
          result['type'] = 'Generate Diann CV Plot from PR and/or PG Matrix files'
          await jobQueue.queue.createJob({type: "diann-cv", data: result})
        }).catch((err) => {
          console.log(err)
        })
      })
    })

  }

  ngOnInit(): void {
    console.log('HomeComponent INIT');

  }

  ngAfterViewInit(): void {
    if (this.fileZone) {
      const fileZoneElement = this.fileZone.nativeElement;

      fileZoneElement.addEventListener("drop", (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const items = e.dataTransfer?.items;
        if (items) {
          for (const item of Array.from(items)) {
            if (item.kind === 'file') {
              const file = item.webkitGetAsEntry();
              if (file) {
                this.recursiveReadDir(file, file.fullPath);
              }
            }
          }
        }
      });

      fileZoneElement.addEventListener("dragover", (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      });

      fileZoneElement.addEventListener("dragenter", (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
      });
    }
  }

  openDialog(): void {
    this.electronService.openDialog().then((files: { filePaths: string[] }) => {
      files.filePaths.forEach(filePath => {
        try {
          const buffer = this.electronService.fs.readFileSync(filePath);
          const arrayData = buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
          const fileName = this.electronService.path.basename(filePath);
          const file = new File([arrayData], fileName);

          const fileType = file.name.split('.').pop()?.toLowerCase();
          if (fileType) {
            const isTabular = ['tsv', 'csv', 'txt'].includes(fileType);
            const isFasta = ['fa', 'fasta'].includes(fileType);

            if (isTabular || isFasta) {
              this.electronService.files.push({
                checked: false,
                file: file,
                path: filePath,
                name: fileName,
                isTabular: isTabular,
                isFasta: isFasta
              });
            }
          }
        } catch (error: any) {
          console.error(`Error reading file ${filePath}: ${error.message}`);
        }
      });
    }).catch(error => {
      console.error(`Error opening dialog: ${error.message}`);
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  recursiveReadDir(file: any, path: string) {
    if (file.isDirectory) {
      const reader = file.createReader();
      reader.readEntries((entries: any) => {
        for (const entry of entries) {
          this.recursiveReadDir(entry, entry.fullPath as string)
        }
      })
    } else if (file.isFile) {
      this.getFileObject(file as FileSystemFileEntry).then((f: any) => {
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
      }).catch((err) => {
        console.log(err)
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        this.electronService.sniffFile(f.file).then((data: any) => {
          this.sniffContent = data.result
          this.table = fromCSV(this.sniffContent.join("\n"))
          this.columns = this.table.getColumnNames()
          this.tableArray = this.table.toArray()
        }).catch((err) => {
          console.log(err)
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

    return await new Promise<File>((resolve, reject) => {
      (file as FileSystemFileEntry).file(resolve, reject);
    });
  }
}
