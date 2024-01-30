import {Component, EventEmitter, Input, Output, TemplateRef, ViewChild} from '@angular/core';
import {NgbOffcanvas} from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @ViewChild('sidebar') sidebar: TemplateRef<any>|undefined;
  @Output() openChange: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Input() set open(value: boolean) {
    if (value && this.sidebar && !this.canvas.hasOpenOffcanvas()) {
      this.slideOpenCanvas(this.sidebar)
    } else {
      if (this.canvas.hasOpenOffcanvas()) {
        this.canvas.dismiss()
      }
    }
  };

  slideOpenCanvas(canvasContent: TemplateRef<any>) {
    this.canvas.open(canvasContent).result.then((result) => {
      this.openChange.emit(false)
    }, (reason) => {
      this.openChange.emit(false)
    })
  }

  constructor(private canvas: NgbOffcanvas) {

  }

  close() {
    this.canvas.dismiss()
    this.openChange.emit(false)
  }

}
