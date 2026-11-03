import { Routes } from '@angular/router';
import { Login } from './login/login';
import { PollutionDetail } from './pollution-detail/pollution-detail';
import { PollutionForm } from './pollution-form/pollution-form';
import { PollutionList } from './pollution-list/pollution-list';
import { authGuard } from './shared/auth-guard';
import { Signup } from './signup/signup';
import { UserList } from './user-list/user-list';

export const routes: Routes = [
  { path: '', redirectTo: 'pollutions', pathMatch: 'full' },
  { path: 'pollutions', component: PollutionList, title: 'Pollutions signalées' },
  {
    path: 'pollutions/nouvelle',
    component: PollutionForm,
    title: 'Déclarer une pollution',
    canActivate: [authGuard],
  },
  { path: 'pollutions/:id', component: PollutionDetail, title: "Détail d'une pollution" },
  {
    path: 'pollutions/:id/modifier',
    component: PollutionForm,
    title: 'Modifier une pollution',
    canActivate: [authGuard],
  },
  { path: 'utilisateurs', component: UserList, title: 'Utilisateurs inscrits' },
  { path: 'inscription', component: Signup, title: 'Inscription' },
  { path: 'connexion', component: Login, title: 'Connexion' },
  { path: '**', redirectTo: 'pollutions' },
];
