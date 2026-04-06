import { Routes } from '@angular/router';
import {Home} from './components/web/home/home';
import {Start} from './components/web/start/start';
import {authGuard} from './guards/auth-guard';
import {Profile} from './components/web/profile/profile';
import {WeaponsPage} from './components/web/categories/weapons/weapons';

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
    path: 'weapons',
    component: WeaponsPage,
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
