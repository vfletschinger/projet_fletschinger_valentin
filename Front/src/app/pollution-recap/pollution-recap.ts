import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Pollution } from '../models/pollution';

@Component({
  selector: 'app-pollution-recap',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './pollution-recap.html',
  styleUrl: './pollution-recap.css',
})
export class PollutionRecap {
  @Input({ required: true }) pollution!: Pollution;
}
