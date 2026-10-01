import { Routes } from '@angular/router';
import { Signup } from './signup/signup';

export const routes: Routes = [
  { path: '', component: Signup, title: 'Inscription' },
  { path: '**', redirectTo: '' },
];
