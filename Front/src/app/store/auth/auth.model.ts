/** Profil de l'utilisateur connecté, tel que le store le conserve (authentification simulée). */
export interface UserProfile {
  id: number;
  email: string;
  nom: string;
  role: string;
}

/** Forme de la tranche `auth` du store NGXS. */
export interface AuthStateModel {
  user: UserProfile | null;
  isAuthenticated: boolean;
}
