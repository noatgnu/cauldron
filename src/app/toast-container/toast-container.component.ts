import { Component } from '@angular/core';
import {NgbToast} from "@ng-bootstrap/ng-bootstrap";
import {ToastService} from "./toast.service";
import {NgClass} from "@angular/common";

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [
    NgbToast,
    NgClass
  ],
  templateUrl: './toast-container.component.html',
  styleUrl: './toast-container.component.scss'
})
export class ToastContainerComponent {
  constructor(public toastService: ToastService) { }

}
