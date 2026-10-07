import { Routes } from '@angular/router';
import { PollutionForm } from './pollution-form/pollution-form';
import { Signup } from './signup/signup';

export const routes: Routes = [
  { path: '', component: PollutionForm, title: 'Déclarer une pollution' },
  { path: 'inscription', component: Signup, title: 'Inscription' },
  { path: '**', redirectTo: '' },
];
