import { Component, Input } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Observacion } from '../models/observacion.model';

@Component({
  selector: 'app-observaciones-tab',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './observaciones-tab.component.html',
  styleUrls: ['./observaciones-tab.component.scss']
})
export class ObservacionesTabComponent {
  @Input() observaciones: Observacion[] = [];
}
