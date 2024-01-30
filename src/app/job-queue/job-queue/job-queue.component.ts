import { Component } from '@angular/core';
import {DataStorageSettingsComponent} from "../../settings/data-storage-settings/data-storage-settings.component";
import {ElectronService} from "../../core/services";
import {JobQueueService} from "../job-queue.service";
import {Job} from "embedded-queue";
import {NgClass} from "@angular/common";
import {NgbProgressbar} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-job-queue',
  standalone: true,
  imports: [
    DataStorageSettingsComponent,
    NgClass,
    NgbProgressbar
  ],
  templateUrl: './job-queue.component.html',
  styleUrl: './job-queue.component.scss'
})
export class JobQueueComponent {
  jobMap: {[key: string]: {completed: boolean, job: Job, error: boolean}} = {}
  clickedJob: Job | undefined;
  settings = this.electronService.settings;

  constructor(private jobQueue: JobQueueService, private electronService: ElectronService) {
    this.jobMap = this.jobQueue.jobMap
  }

  getJobData(job: Job){
    return job.data as any
  }

  openFileExplorerAt(id: string) {
    this.electronService.remote.shell.openPath(this.settings.resultStoragePath+this.electronService.path.sep+id).then(() => {

    })
  }

  protected readonly Object = Object;
}
