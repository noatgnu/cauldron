import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {JobQueueComponent} from "./job-queue/job-queue.component";
import {JobQueueRoutingModule} from "./job-queue-routing.moudle";



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    JobQueueComponent,
    JobQueueRoutingModule
  ]
})
export class JobQueueModule { }
