import {Component, Input} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {Form, FormBuilder, FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";
import {NgxColorsModule} from "ngx-colors";

@Component({
  selector: 'app-condition-color-assignment',
  standalone: true,
  imports: [
    NgxColorsModule,
    ReactiveFormsModule
  ],
  templateUrl: './condition-color-assignment.component.html',
  styleUrl: './condition-color-assignment.component.scss'
})
export class ConditionColorAssignmentComponent {
  @Input() conditions: string[] = []
  _form: FormGroup = this.fb.group({})
  @Input() set form(value: FormGroup) {
    this._form = value
  }

  get form(): FormGroup {
    return this._form
  }

  constructor(private fb: FormBuilder) {

  }

}
