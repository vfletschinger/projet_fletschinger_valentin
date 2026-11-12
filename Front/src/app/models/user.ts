/** Compte tel que renvoyé par l'API : le mot de passe n'en sort jamais. */
export interface User {
  id: string;
  login: string;
  lastName: string;
  firstName: string;
  email: string;
  createdAt: string;
}

/** Corps envoyé à l'API en création : l'id et la date sont fournis par le serveur. */
export type UserRequest = Omit<User, 'id' | 'createdAt'> & { password: string };

/** Identifiants envoyés à la route de connexion (authentification fictive). */
export type LoginRequest = Pick<UserRequest, 'login' | 'password'>;

/** Saisie du formulaire d'inscription : la confirmation du mot de passe reste côté client. */
export type SignupForm = UserRequest & { confirmPassword: string };
