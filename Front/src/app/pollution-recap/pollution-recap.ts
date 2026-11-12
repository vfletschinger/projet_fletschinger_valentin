import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { Pollution } from '../models/pollution';
import { HighlightPollutionDirective } from '../shared/highlight-pollution-directive';
import { PollutionLevelPipe } from '../shared/pollution-level-pipe';

@Component({
  selector: 'app-pollution-recap',
  standalone: true,
  imports: [DatePipe, PollutionLevelPipe, HighlightPollutionDirective],
  templateUrl: './pollution-recap.html',
  styleUrl: './pollution-recap.css',
  // Composant de pure présentation : ne se rafraîchit que si `pollution` change de référence.
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollutionRecap {
  @Input({ required: true }) pollution!: Pollution;
}
