import {Component, Input} from '@angular/core';
import {getUniprotFromFields, uniprotColumns, uniprotSections} from "uniprotparserjs";
import {FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {NgbActiveModal} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-uniprot-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './uniprot-modal.component.html',
  styleUrl: './uniprot-modal.component.scss'
})
export class UniprotModalComponent {
  uniprotFromFields: {groupName: string, items: any[]}[] = []
  @Input() columns: string[] = []
  dataMap: {[key: string]: {label: string, fieldId: string, section: string}[]} = {}
  columnFormMap: {[key: string]: FormGroup<{columns: FormControl<string[]>}>} = {}
  sections = uniprotSections;

  private _fieldParameters: string = ''

  @Input() set fieldParameters(value: string) {
    this._fieldParameters = value
    for (const section of this.uniprotSections) {
      // @ts-ignore
      this.columnFormMap[section] = this.fb.group({
        columns: new FormControl<string[]>([]),
      })
    }
    const fields = this.fieldParameters.split(',')
    for (const col of uniprotColumns) {
      if (!this.dataMap[col.section]) {
        this.dataMap[col.section] = []
      }
      this.dataMap[col.section].push(col)
      if (fields.includes(col.fieldId)) {
        this.columnFormMap[col.section].controls['columns'].setValue([...this.columnFormMap[col.section].controls['columns'].value, col.fieldId])
      }
    }

  }
  get fieldParameters(): string {
    return this._fieldParameters
  }

  uniprotCols = uniprotColumns;
  uniprotSectionMap: any = {}
  uniprotSections = uniprotSections;

  form: FormGroup = this.fb.group({
    from: new FormControl<string>('UniProtKB_AC-ID', Validators.required),
    to: new FormControl<string>('UniProtKB', Validators.required),
    column: new FormControl<string>('', Validators.required),
    selectedUniProtColumns: new FormControl<string[]>([], Validators.required),
  })
  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal) {
    for (const section of this.uniprotCols) {
      if (!this.uniprotSectionMap[section.section]) {
        this.uniprotSectionMap[section.section] = []
      }
      this.uniprotSectionMap[section.section].push(section)
    }

    getUniprotFromFields().then((res: any) => {
      this.uniprotFromFields = res
    })
  }

  cancel() {
    this.activeModal.dismiss()
  }

  submit() {
    let selectedColumns: string[] = []
    for (const s of uniprotSections) {
      if (this.columnFormMap[s]) {
        if (this.columnFormMap[s].value.columns) {
          // @ts-ignore
          for (const fieldId of this.columnFormMap[s].value.columns) {
            selectedColumns.push(fieldId)
          }
        }

      }
    }
    this.form.controls['selectedUniProtColumns'].setValue(selectedColumns)
    if (this.form.valid) {
      this.activeModal.close(this.form.value)
    }
  }

}
