import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, tap } from 'rxjs';
import { Team } from '../common/interface';

export const EMPTY_TEAM: Team = {
  weapon_r1: null, weapon_r2: null, weapon_r3: null,
  weapon_l1: null, weapon_l2: null, weapon_l3: null,
  arrow1: null, arrow2: null,
  bolt1: null,  bolt2: null,
  ash1: null, ash2: null, ash3: null,
  armor_head: null, armor_chest: null, armor_hands: null, armor_legs: null,
  talisman1: null, talisman2: null, talisman3: null, talisman4: null,
  item1: null, item2: null, item3: null, item4: null, item5: null,
  item6: null, item7: null, item8: null, item9: null, item10: null,
  spell1: null, spell2: null, spell3: null, spell4: null, spell5: null,
};

export const CATEGORY_SLOTS: Record<string, string[]> = {
  weapons:      ['weapon_r1', 'weapon_r2', 'weapon_r3', 'weapon_l1', 'weapon_l2', 'weapon_l3'],
  shields:      ['weapon_l1', 'weapon_l2', 'weapon_l3'],
  ammos:        ['arrow1', 'arrow2', 'bolt1', 'bolt2'],
  armors:       ['armor_head', 'armor_chest', 'armor_hands', 'armor_legs'],
  ashes:        ['ash1', 'ash2', 'ash3'],
  talismans:    ['talisman1', 'talisman2', 'talisman3', 'talisman4'],
  items:        ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10'],
  sorceries:    ['spell1', 'spell2', 'spell3', 'spell4', 'spell5'],
  incantations: ['spell1', 'spell2', 'spell3', 'spell4', 'spell5'],
  spirits:      ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10'],
};

@Injectable({
  providedIn: 'root'
})
export class TeamService {

  private readonly http = inject(HttpClient);
  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  team  = signal<Team>({ ...EMPTY_TEAM });
  teams = signal<any[]>([]);

  loadTeam(): Observable<any> {
    return this.http.get<{ status: number; team: Team }>(`${this.backendUrl}/team`).pipe(
      tap(res => {
        if (res.team && Object.keys(res.team).length > 0) {
          this.team.set({ ...EMPTY_TEAM, ...res.team });
        }
      })
    );
  }

  loadAllTeams(): Observable<any> {
    return this.http.get<{ status: number; teams: any[] }>(`${this.backendUrl}/team/all`).pipe(
      tap(res => {
        if (res.teams) this.teams.set(res.teams);
      })
    );
  }

  saveTeam(): Observable<any> {
    const team = { ...this.team() } as any;
    if (!team.id_team) return of(null);
    delete team.id_user;
    delete team.is_active;
    delete team.name;
    return this.http.put(`${this.backendUrl}/team`, team);
  }

  saveTeamAs(name: string): Observable<any> {
  const teamData = { ...this.team() } as any;
  delete teamData.name;
  delete teamData.id_team;
  delete teamData.id_user;
  delete teamData.is_active;

  return this.http.post(`${this.backendUrl}/team/save-as`, {
    name,
    ...teamData
  });
}

  loadSavedTeam(teamId: number): Observable<any> {
    return this.http.post<{ team: Team }>(`${this.backendUrl}/team/load`, { id_team: teamId }).pipe(
      tap(res => {
        if (res.team) this.team.set({ ...EMPTY_TEAM, ...res.team });
      })
    );
  }

  deleteTeam(teamId: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/team/${teamId}`).pipe(
      tap(() => this.teams.update(ts => ts.filter(t => t.id_team !== teamId)))
    );
  }

  renameTeam(teamId: number, name: string): Observable<any> {
    return this.http.patch(`${this.backendUrl}/team/${teamId}`, { name }).pipe(
      tap(() => {
        this.teams.update(ts => ts.map(t => t.id_team === teamId ? { ...t, name } : t));
        if ((this.team() as any).id_team === teamId) {
          this.team.update(t => ({ ...t, name }));
        }
      })
    );
  }

  removeFromSlot(slot: string): void {
    this.team.update(t => ({ ...t, [slot]: null }));
  }

  isInTeam(apiId: string): boolean {
    const t = this.team() as any;
    return Object.values(t).includes(apiId);
  }
}
