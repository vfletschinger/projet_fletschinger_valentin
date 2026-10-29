export const POLLUTION_TYPES = [
  'Plastique',
  'Chimique',
  'Dépôt sauvage',
  'Eau',
  'Air',
  'Autre',
] as const;

export type PollutionType = (typeof POLLUTION_TYPES)[number];

export interface Pollution {
  id: string;
  title: string;
  type: PollutionType | '';
  description: string;
  observedAt: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string;
}

/** Corps envoyé à l'API en création comme en modification : l'id est fourni par le serveur. */
export type PollutionRequest = Omit<Pollution, 'id'>;
