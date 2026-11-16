import { Pipe, PipeTransform } from '@angular/core';
import { pollutionLevel } from './pollution-level';

export type PollutionLevelFormat = 'short' | 'detailed';

/**
 * Affiche le niveau de pollution correspondant à un indice de dangerosité.
 *
 *   {{ 75 | pollutionLevel }}              → « Élevée »
 *   {{ 75 | pollutionLevel: 'detailed' }}  → « Élevée (indice 75) »
 *
 * Pipe pure (comportement par défaut) : Angular ne rappelle `transform` que si l'indice
 * ou le format changent, jamais à chaque cycle de détection des changements.
 */
@Pipe({
  name: 'pollutionLevel',
  standalone: true,
})
export class PollutionLevelPipe implements PipeTransform {
  transform(
    dangerIndex: number | null | undefined,
    format: PollutionLevelFormat = 'short',
  ): string {
    if (dangerIndex === null || dangerIndex === undefined) {
      return '';
    }

    const level = pollutionLevel(dangerIndex);

    return format === 'detailed' ? `${level} (indice ${dangerIndex})` : level;
  }
}
