export type PollutionLevel = 'Faible' | 'Modérée' | 'Élevée' | 'Dangereuse';

/**
 * Classe un indice de dangerosité dans l'un des quatre niveaux de pollution.
 * Source unique des seuils : la pipe (texte) et la directive (couleur) s'appuient dessus.
 */
export function pollutionLevel(dangerIndex: number): PollutionLevel {
  if (dangerIndex <= 20) {
    return 'Faible';
  }
  if (dangerIndex <= 50) {
    return 'Modérée';
  }
  if (dangerIndex <= 100) {
    return 'Élevée';
  }
  return 'Dangereuse';
}
