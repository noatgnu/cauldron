import {Component, Input, NgZone} from '@angular/core';
import {NgbActiveModal, NgbProgressbar} from "@ng-bootstrap/ng-bootstrap";
import {ElectronService} from "../../core/services";
import {FormBuilder, ReactiveFormsModule} from "@angular/forms";

@Component({
  selector: 'app-download-extra-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgbProgressbar
  ],
  templateUrl: './download-extra-dialog.component.html',
  styleUrl: './download-extra-dialog.component.scss'
})
export class DownloadExtraDialogComponent {
  private _environment: string = "python"
  platforms: string[] = ["linux", "darwin", "win"]
  archs: string[] = ["arm64", "x84_64"]


  @Input() set environment(value: string) {
    this._environment = value
  }

  get environment(): string {
    return this._environment
  }

  form = this.fb.group({
    platform: ["win"],
    arch: ["x84_64"],
    url: [""]
  })

  progressMap: { [key: string]: number } = {}
  messages: string[] = []
  logs: string[] = []
  downloading: boolean = false
  constructor(private modal: NgbActiveModal, private electronService: ElectronService, private fb: FormBuilder, private zone: NgZone) {
    this.form.controls["platform"].valueChanges.subscribe((value) => {
      if (value) {
        // @ts-ignore
        this.setURL(value, this.form.controls["arch"].value)
      }

    })
    this.form.controls["arch"].valueChanges.subscribe((value) => {
      if (value) {
        // @ts-ignore
        this.setURL(this.form.controls["platform"].value, value)
      }
    })
    if (this.platforms.includes(this.electronService.translatedPlatform)) {
      this.form.controls["platform"].setValue(this.electronService.translatedPlatform)
      // @ts-ignore
      this.setURL(this.electronService.translatedPlatform, this.form.controls["arch"].value)
    }
    if (this.archs.includes(this.electronService.arch())) {
      this.form.controls["arch"].setValue(this.electronService.arch())
      // @ts-ignore
      this.setURL(this.electronService.arch(), this.form.controls["arch"].value)
    }
    this.electronService.downloadExtraMessageSubject.subscribe((value) => {
      this.logs.push(value.message)
      if (value.message === "Finished") {
        this.zone.run(() => {
          this.downloading = false
          this.form.enable()
          this.messages.push(value.message)
        })
      } else {
        if (value.message.startsWith("Downloading")) {
          if (!this.progressMap[value.message]) {

            this.zone.run(() => {
              this.progressMap[value.message] = 0
              this.messages.push(value.message)
            })
          }
          if (value.percentage !== this.progressMap[value.message]) {
            this.zone.run(() => {
              console.log(value.percentage)
              this.progressMap[value.message] = value.percentage
            })
          }
        } else if (value.message.startsWith("Extracting")) {
          if (!this.progressMap[value.message]) {
            this.zone.run(() => {
              this.progressMap[value.message] = 0
              this.messages.push(value.message)
            })
          }
          if (value.progress !== this.progressMap[value.message]) {
            this.zone.run(() => {
              this.progressMap[value.message] = value.progress
            })
          }
        }

      }

    })
  }

  setURL(platform: string, arch: string) {
    this.electronService.getDownloadURL(platform, arch, this.electronService.appVersion, this.environment).then(
      (url: string) => {
        this.form.controls["url"].setValue(url)
      }
    )
  }

  download() {
    // on downloading, disable the download button and the form
    if (this.downloading) {
      return
    }
    this.messages = []
    this.logs = []
    this.progressMap = {}
    this.downloading = true
    this.form.disable()
    if (this.environment === "python") {
      // @ts-ignore
      this.electronService.downloadAndSaveExtra(this.form.value.url, "python.tar.gz").then(
        (result) => {
          console.log(result)
        }
      )
    } else {
      // @ts-ignore
      this.electronService.downloadAndSaveExtra(this.form.value.url, "r-portable.tar.gz").then(
        (result) => {
          console.log(result)
        }
      )
    }
  }

  close() {
    this.modal.dismiss()
  }

}
