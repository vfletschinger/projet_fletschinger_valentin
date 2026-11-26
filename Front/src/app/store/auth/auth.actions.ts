/**
 * Actions de la tranche `auth`. Une action décrit un événement ; c'est `AuthState` qui décide
 * comment l'état change en réponse. Le `type` est l'identifiant affiché dans Redux DevTools.
 */

/** L'utilisateur vient de se connecter. */
export class Login {
  static readonly type = '[Auth] Login';
  constructor(public readonly payload: { email: string; nom: string }) {}
}

/** L'utilisateur se déconnecte (ou sa session doit être fermée). */
export class Logout {
  static readonly type = '[Auth] Logout';
}
