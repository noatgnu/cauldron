import { Component } from '@angular/core';
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-protocol-io-citation-export-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule,
  ],
  templateUrl: './protocol-io-citation-export-modal.component.html',
  styleUrl: './protocol-io-citation-export-modal.component.scss'
})
export class ProtocolIoCitationExportModalComponent {
  form: FormGroup = this.fb.group({
    idList: new FormControl<string>("")
  })
  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal) {

  }

  close() {
    this.activeModal.dismiss()
  }

  download() {
    this.activeModal.close(this.form.value)
  }
}
