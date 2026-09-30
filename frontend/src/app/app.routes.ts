import { Routes } from '@angular/router';
import {LoginComponent } from '../app/pages/login/login';
import { Dashboard } from './pages/dashboard/dashboard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Si entran a la raíz '/', redirigir a /login
  { path: 'login', component: LoginComponent },          // Mostrar el LoginComponent en /login
  { path: 'dashboard', component: Dashboard}
];