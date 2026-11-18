import { Routes } from '@angular/router';
import { authGuard } from './shared/auth-guard';
import { guestGuard } from './shared/guest-guard';

/**
 * Routes racines. Aucun écran n'est importé statiquement : chaque `import()` dynamique devient un
 * chunk séparé que le navigateur ne télécharge qu'à la première visite de la route concernée.
 * Le bundle initial ne contient donc que la coquille (`App`, la barre de navigation) et les services.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'pollutions', pathMatch: 'full' },
  {
    path: 'pollutions',
    loadChildren: () => import('./pollutions/pollutions.routes').then((m) => m.POLLUTION_ROUTES),
  },
  {
    path: 'utilisateurs',
    loadComponent: () => import('./users/user-list/user-list').then((m) => m.UserList),
    title: 'Utilisateurs inscrits',
    // Le guard s'exécute avant le téléchargement du composant : un visiteur ne charge jamais ce chunk.
    canActivate: [authGuard],
  },
  {
    path: 'inscription',
    loadComponent: () => import('./auth/signup/signup').then((m) => m.Signup),
    title: 'Inscription',
  },
  {
    path: 'connexion',
    loadComponent: () => import('./auth/login/login').then((m) => m.Login),
    title: 'Connexion',
    canActivate: [guestGuard],
  },
  { path: '**', redirectTo: 'pollutions' },
];
