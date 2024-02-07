import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";
import {ProfilePlotComponent} from "../../plots/profile-plot/profile-plot.component";

@Component({
  selector: 'app-profile-plot-modal',
  standalone: true,
  imports: [
    ProfilePlotComponent
  ],
  templateUrl: './profile-plot-modal.component.html',
  styleUrl: './profile-plot-modal.component.scss'
})
export class ProfilePlotModalComponent {
  @Input() annotation: IDataFrame<number, {Sample: string, Condition: string}> = new DataFrame()

  constructor(private activeModal: NgbActiveModal) {

  }

  close() {
    this.activeModal.dismiss()
  }

}
