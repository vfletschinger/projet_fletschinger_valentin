import { Directive, computed, input } from '@angular/core';
import { PollutionLevel, pollutionLevel } from './pollution-level';

/** Couleurs définies comme design tokens dans `styles.css`. */
const LEVEL_STYLES: Record<PollutionLevel, { background: string; color: string }> = {
  Faible: { background: 'var(--level-low)', color: 'var(--ink)' },
  Modérée: { background: 'var(--level-moderate)', color: 'var(--ink)' },
  Élevée: { background: 'var(--level-high)', color: 'var(--ink)' },
  Dangereuse: { background: 'var(--level-danger)', color: '#fff' },
};

/**
 * Colore le fond de l'élément hôte selon le niveau de pollution de l'indice reçu :
 *
 *   <span [appHighlightPollution]="pollution.dangerIndex">…</span>
 *
 * Les styles passent par des liaisons `host` : Angular les applique lui-même, sans
 * toucher au DOM via `ElementRef.nativeElement`, et ne les recalcule que si l'indice change.
 */
@Directive({
  selector: '[appHighlightPollution]',
  standalone: true,
  host: {
    '[style.background-color]': 'levelStyle().background',
    '[style.color]': 'levelStyle().color',
  },
})
export class HighlightPollutionDirective {
  readonly dangerIndex = input.required<number>({ alias: 'appHighlightPollution' });

  protected readonly levelStyle = computed(() => LEVEL_STYLES[pollutionLevel(this.dangerIndex())]);
}
