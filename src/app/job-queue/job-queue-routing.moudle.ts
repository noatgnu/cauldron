import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import {JobQueueComponent} from "./job-queue/job-queue.component";

const routes: Routes = [
  {
    path: 'job-queue',
    component: JobQueueComponent
  }
];

@NgModule({
  declarations: [],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class JobQueueRoutingModule {}
