import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';
import {LoginComponent } from '../app/pages/login/login';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { JoinProjectComponent } from './pages/join-project/join-project';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard';
import { AdminProjectsComponent } from './pages/admin-projects/admin-projects';
import { AdminPersonalComponent } from './pages/admin-personal/admin-personal';
import { AdminPersonalProjectComponent } from './pages/admin-personal-project/admin-personal-project';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' }, // Si entran a la raíz '/', redirigir a /login
  { path: 'login', component: LoginComponent },          // Mostrar el LoginComponent en /login
  { path: 'dashboard', component: DashboardComponent},
  { path: 'join', component: JoinProjectComponent},
  { 
    path: 'admin/dashboard', 
    component: AdminDashboardComponent, // Tu componente de admin
    canActivate: [adminGuard]           // Aplica la protección aquí
  },
  {path: 'admin/proyectos',component:AdminProjectsComponent, 
    canActivate: [adminGuard]
  },
  {path: 'admin/personal',component:AdminPersonalComponent, 
    canActivate: [adminGuard]
  },
  {path: 'admin/personal/proyecto',component:AdminPersonalProjectComponent, 
    canActivate: [adminGuard]
  }

];