import { Routes } from '@angular/router';
import {Home} from './components/web/home/home';
import {NPCsPage} from './components/web/npcs-page/npcs-page';
import {Start} from './components/web/start/start';
import {Login} from './components/web/auth/login/login';
import {guestGuard} from './guards/guest-guard';
import {Register} from './components/web/auth/register/register';
import {authGuard} from './guards/auth-guard';
import {Profile} from './components/web/profile/profile';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
  },
  {
    path: 'start',
    component: Start,
  },
  {
    path: 'home',
    component: Home,
  },
  {
    path: 'npc-page',
    component: NPCsPage,
  },
  {
    path: 'login-page',
    component: Login,
    canActivate: [guestGuard]
  },
  {
    path: 'register-page',
    component: Register,
    canActivate: [guestGuard]
  },
  {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'home',
    pathMatch: 'full',
  }
];
