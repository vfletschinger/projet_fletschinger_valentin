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
  title: string;
  type: PollutionType | '';
  description: string;
  observedAt: string;
  place: string;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string;
}
