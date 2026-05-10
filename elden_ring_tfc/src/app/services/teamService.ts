import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import {Team} from '../common/interface';


export const EMPTY_TEAM: Team = {
  weapon_r1: null, weapon_r2: null, weapon_r3: null,
  weapon_l1: null, weapon_l2: null, weapon_l3: null,
  arrow1: null, arrow2: null,
  bolt1: null,  bolt2: null,
  armor_head: null, armor_chest: null, armor_hands: null, armor_legs: null,
  talisman1: null, talisman2: null, talisman3: null, talisman4: null,
  item1: null, item2: null, item3: null, item4: null, item5: null,
  item6: null, item7: null, item8: null, item9: null, item10: null,
};

// Qué categorías van a qué slots
export const CATEGORY_SLOTS: Record<string, string[]> = {
  weapons:  ['weapon_r1', 'weapon_r2', 'weapon_r3', 'weapon_l1', 'weapon_l2', 'weapon_l3'],
  shields:  ['weapon_l1', 'weapon_l2', 'weapon_l3'],
  ammos:    ['arrow1', 'arrow2', 'bolt1', 'bolt2'],
  armors:   ['armor_head', 'armor_chest', 'armor_hands', 'armor_legs'],
  talismans:['talisman1', 'talisman2', 'talisman3', 'talisman4'],
  items:    ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10'],
  ashes:    ['weapon_r1', 'weapon_r2', 'weapon_r3', 'weapon_l1', 'weapon_l2', 'weapon_l3'],
  spirits:  ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10'],
  sorceries:['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10'],
  incantations: ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10'],
  creatures:['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10'],
};

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private readonly http = inject(HttpClient);
  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  team = signal<Team>({ ...EMPTY_TEAM });

  loadTeam(): Observable<any> {
    return this.http.get<{ status: number; team: Team }>(`${this.backendUrl}/team`).pipe(
      tap(res => {
        if (res.team && Object.keys(res.team).length > 0) {
          this.team.set({ ...EMPTY_TEAM, ...res.team });
        }
      })
    );
  }

  saveTeam(): Observable<any> {
    return this.http.put(`${this.backendUrl}/team`, this.team());
  }

  // Añadir un item al primer slot libre de su categoría
  addToTeam(apiId: string, category: string): boolean {
    const slots = CATEGORY_SLOTS[category];
    if (!slots) return false;

    const current = { ...this.team() } as any;

    // Verificar que no está ya en el equipo
    for (const slot of slots) {
      if (current[slot] === apiId) return false;
    }

    // Buscar primer slot libre
    for (const slot of slots) {
      if (!current[slot]) {
        current[slot] = apiId;
        this.team.set(current);
        return true;
      }
    }

    return false; // No hay slots libres
  }

  // Quitar un item de un slot
  removeFromSlot(slot: string): void {
    this.team.update(t => ({ ...t, [slot]: null }));
  }

  // Comprobar si un item ya está en el equipo
  isInTeam(apiId: string): boolean {
    const t = this.team() as any;
    return Object.values(t).includes(apiId);
  }
}
