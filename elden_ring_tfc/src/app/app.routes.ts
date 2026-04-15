import { Routes } from '@angular/router';
import { Home } from './components/web/home/home';
import { Start } from './components/web/start/start';
import { authGuard } from './guards/auth-guard';
import { Profile } from './components/web/profile/profile';
import { WeaponsPage } from './components/web/categories/weapons/weapons';
import { AmmosPage } from './components/web/categories/ammos/ammos';
import { ArmorsPage } from './components/web/categories/armors/armors';
import { AshesPage } from './components/web/categories/ashes/ashes';
import { BossesPage } from './components/web/categories/bosses/bosses';
import { ClassesPage } from './components/web/categories/classes/classes';
import { CreaturesPage } from './components/web/categories/creatures/creatures';
import { IncantationsPage } from './components/web/categories/incantations/incantations';
import { ItemsPage } from './components/web/categories/items/items';
import { LocationsPage } from './components/web/categories/locations/locations';
import { ShieldsPage } from './components/web/categories/shields/shields';
import { SorceriesPage } from './components/web/categories/sorceries/sorceries';
import { SpiritsPage } from './components/web/categories/spirits/spirits';
import { TalismansPage } from './components/web/categories/talismans/talismans';
import {NpcsPage} from './components/web/categories/npcs/npcs';

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
    path: 'ammos',
    component: AmmosPage,
  },
  {
    path: 'armors',
    component: ArmorsPage,
  },
  {
    path: 'ashes',
    component: AshesPage,
  },
  {
    path: 'bosses',
    component: BossesPage,
  },
  {
    path: 'classes',
    component: ClassesPage,
  },
  {
    path: 'creatures',
    component: CreaturesPage,
  },
  {
    path: 'incantations',
    component: IncantationsPage,
  },
  {
    path: 'items',
    component: ItemsPage,
  },
  {
    path: 'locations',
    component: LocationsPage,
  },
  {
    path: 'npcs',
    component: NpcsPage,
  },
  {
    path: 'shields',
    component: ShieldsPage,
  },
  {
    path: 'sorceries',
    component: SorceriesPage,
  },
  {
    path: 'spirits',
    component: SpiritsPage,
  },
  {
    path: 'talismans',
    component: TalismansPage,
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
