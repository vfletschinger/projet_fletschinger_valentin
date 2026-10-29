import { Routes } from '@angular/router';
import { PollutionDetail } from './pollution-detail/pollution-detail';
import { PollutionForm } from './pollution-form/pollution-form';
import { PollutionList } from './pollution-list/pollution-list';
import { Signup } from './signup/signup';

export const routes: Routes = [
  { path: '', redirectTo: 'pollutions', pathMatch: 'full' },
  { path: 'pollutions', component: PollutionList, title: 'Pollutions signalées' },
  { path: 'pollutions/nouvelle', component: PollutionForm, title: 'Déclarer une pollution' },
  { path: 'pollutions/:id', component: PollutionDetail, title: "Détail d'une pollution" },
  { path: 'pollutions/:id/modifier', component: PollutionForm, title: 'Modifier une pollution' },
  { path: 'inscription', component: Signup, title: 'Inscription' },
  { path: '**', redirectTo: 'pollutions' },
];
