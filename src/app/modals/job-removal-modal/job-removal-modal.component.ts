import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-job-removal-modal',
  standalone: true,
  imports: [],
  templateUrl: './job-removal-modal.component.html',
  styleUrl: './job-removal-modal.component.scss'
})
export class JobRemovalModalComponent {
  constructor(private activeModal: NgbActiveModal) {
  }

  close() {
    this.activeModal.dismiss()
  }

  remove() {
    this.activeModal.close(true)
  }
}
