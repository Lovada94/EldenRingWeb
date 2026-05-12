import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TeamService, EMPTY_TEAM } from '../../../services/teamService';
import { FavoritesService } from '../../../services/favoritesService';
import { EldenRingApiService } from '../../../services/eldenRingService';
import { catchError, forkJoin, Observable, of } from 'rxjs';
import { Favorite } from '../../../common/interface';

const TEAM_CATEGORIES = ['weapons', 'shields', 'ammos', 'armors', 'talismans', 'items', 'ashes', 'sorceries', 'incantations', 'spirits'];

const ARMOR_SLOT: Record<string, string> = {
  'Helm': 'armor_head', 'Head Armor': 'armor_head',
  'Chest Armor': 'armor_chest', 'Gauntlets': 'armor_hands', 'Leg Armor': 'armor_legs',
};

const CATEGORY_LABELS: Record<string, string> = {
  weapons: 'Armas', shields: 'Escudos', ammos: 'Munición', armors: 'Armaduras',
  talismans: 'Talismanes', items: 'Objetos', ashes: 'Cenizas',
  sorceries: 'Hechizos', incantations: 'Incantaciones', spirits: 'Espíritus',
};

@Component({
  selector: 'app-team-page',
  imports: [FormsModule],
  templateUrl: './team-page.html',
  styleUrl: './team-page.css',
})
export class TeamPage implements OnInit {

  protected readonly teamService    = inject(TeamService);
  private readonly favoritesService = inject(FavoritesService);
  private readonly apiService       = inject(EldenRingApiService);
  private readonly router           = inject(Router);

  private saving = false;

  loaded        = signal<boolean>(false);
  itemsData     = signal<Record<string, any>>({});
  showSaveModal = signal<boolean>(false);
  newTeamName   = '';

  renamingId    = signal<number | null>(null);
  renameValue   = '';
  noTeamMsg     = signal<boolean>(false);

  teamFavorites = computed(() =>
    this.favoritesService.favorites().filter(f => TEAM_CATEGORIES.includes(f.category))
  );

  groupedFavorites = computed(() => {
    const groups: Record<string, Favorite[]> = {};
    for (const fav of this.teamFavorites()) {
      if (!groups[fav.category]) groups[fav.category] = [];
      groups[fav.category].push(fav);
    }
    return groups;
  });

  categories = computed(() => Object.keys(this.groupedFavorites()).sort());

  readonly slotDefs: { slot: string; label: string; category: string }[] = [
    { slot: 'weapon_r1', label: 'Arma D1', category: 'weapons' },
    { slot: 'weapon_r2', label: 'Arma D2', category: 'weapons' },
    { slot: 'weapon_r3', label: 'Arma D3', category: 'weapons' },
    { slot: 'weapon_l1', label: 'Arma I1', category: 'weapons' },
    { slot: 'weapon_l2', label: 'Arma I2', category: 'weapons' },
    { slot: 'weapon_l3', label: 'Arma I3', category: 'weapons' },
    { slot: 'arrow1',  label: 'Flecha 1', category: 'ammos' },
    { slot: 'arrow2',  label: 'Flecha 2', category: 'ammos' },
    { slot: 'bolt1',   label: 'Saeta 1',  category: 'ammos' },
    { slot: 'bolt2',   label: 'Saeta 2',  category: 'ammos' },
    { slot: 'ash1',    label: 'Ceniza 1', category: 'ashes' },
    { slot: 'ash2',    label: 'Ceniza 2', category: 'ashes' },
    { slot: 'ash3',    label: 'Ceniza 3', category: 'ashes' },
    { slot: 'armor_head',  label: 'Casco',   category: 'armors' },
    { slot: 'armor_chest', label: 'Pechera', category: 'armors' },
    { slot: 'armor_hands', label: 'Guantes', category: 'armors' },
    { slot: 'armor_legs',  label: 'Piernas', category: 'armors' },
    { slot: 'talisman1', label: 'Talismán 1', category: 'talismans' },
    { slot: 'talisman2', label: 'Talismán 2', category: 'talismans' },
    { slot: 'talisman3', label: 'Talismán 3', category: 'talismans' },
    { slot: 'talisman4', label: 'Talismán 4', category: 'talismans' },
    { slot: 'item1',  label: 'Objeto 1',  category: 'items' },
    { slot: 'item2',  label: 'Objeto 2',  category: 'items' },
    { slot: 'item3',  label: 'Objeto 3',  category: 'items' },
    { slot: 'item4',  label: 'Objeto 4',  category: 'items' },
    { slot: 'item5',  label: 'Objeto 5',  category: 'items' },
    { slot: 'item6',  label: 'Objeto 6',  category: 'items' },
    { slot: 'item7',  label: 'Objeto 7',  category: 'items' },
    { slot: 'item8',  label: 'Objeto 8',  category: 'items' },
    { slot: 'item9',  label: 'Objeto 9',  category: 'items' },
    { slot: 'item10', label: 'Objeto 10', category: 'items' },
    { slot: 'spell1', label: 'Hechizo 1', category: 'sorceries' },
    { slot: 'spell2', label: 'Hechizo 2', category: 'sorceries' },
    { slot: 'spell3', label: 'Hechizo 3', category: 'sorceries' },
    { slot: 'spell4', label: 'Hechizo 4', category: 'sorceries' },
    { slot: 'spell5', label: 'Hechizo 5', category: 'sorceries' },
  ];

  totalWeight  = computed(() => this.calcStat('weight'));
  totalAttack  = computed(() => {
    const id = (this.teamService.team() as any).weapon_r1;
    if (!id) return 0;
    const item = this.itemsData()[id];
    if (!item?.attack) return 0;
    const total = item.attack.reduce((sum: number, s: any) => sum + (s.amount ?? 0), 0);
    return Math.round(total * 10) / 10;
  });
  totalDefense = computed(() => this.calcStat('defense'));

  ngOnInit(): void {
    const favs = this.favoritesService.favorites();
    const init = () => {
      forkJoin([
        this.teamService.loadTeam().pipe(catchError(() => of(null))),
        this.teamService.loadAllTeams().pipe(catchError(() => of(null))),
      ]).subscribe(() => this.loadItemsData());
    };
    favs.length > 0 ? init() : this.favoritesService.loadFavorites().subscribe({ next: init });
  }

  getCategoryLabel(cat: string): string { return CATEGORY_LABELS[cat] ?? cat; }
  isWeaponOrShield(cat: string): boolean { return cat === 'weapons' || cat === 'shields'; }

  // ── Añadir / quitar ───────────────────────────────────────────────────

  addRight(fav: Favorite): void {
    const slots = ['weapon_r1', 'weapon_r2', 'weapon_r3'];
    const team  = this.teamService.team() as any;
    const occ   = slots.find(s => team[s] === fav.api_id);
    occ ? this.removeSlot(occ) : this.addToSlots(fav.api_id, slots, fav.category);
  }

  addLeft(fav: Favorite): void {
    const slots = ['weapon_l1', 'weapon_l2', 'weapon_l3'];
    const team  = this.teamService.team() as any;
    const occ   = slots.find(s => team[s] === fav.api_id);
    occ ? this.removeSlot(occ) : this.addToSlots(fav.api_id, slots, fav.category);
  }

  isInRightHand(id: string): boolean {
    const t = this.teamService.team() as any;
    return ['weapon_r1','weapon_r2','weapon_r3'].some(s => t[s] === id);
  }

  isInLeftHand(id: string): boolean {
    const t = this.teamService.team() as any;
    return ['weapon_l1','weapon_l2','weapon_l3'].some(s => t[s] === id);
  }

  addGeneric(fav: Favorite): void {
    if (fav.category === 'armors') {
      const slot = ARMOR_SLOT[fav.subcategory ?? ''];
      if (!slot) return;
      const team = { ...this.teamService.team() } as any;
      if (team[slot] === fav.api_id) { this.removeSlot(slot); return; }
      team[slot] = fav.api_id;
      this.teamService.team.set(team);
      this.teamService.saveTeam().subscribe();
      this.reloadItem(fav.api_id, fav.category);
      return;
    }

    if (fav.category === 'ammos') {
      const sub   = (fav.subcategory ?? fav.name).toLowerCase();
      const slots = sub.includes('bolt') ? ['bolt1','bolt2'] : ['arrow1','arrow2'];
      const team  = this.teamService.team() as any;
      const occ   = slots.find(s => team[s] === fav.api_id);
      occ ? this.removeSlot(occ) : this.addToSlots(fav.api_id, slots);
      return;
    }

    const slotMap: Record<string, string[]> = {
      talismans:    ['talisman1','talisman2','talisman3','talisman4'],
      ashes:        ['ash1','ash2','ash3'],
      items:        ['item1','item2','item3','item4','item5','item6','item7','item8','item9','item10'],
      sorceries:    ['spell1','spell2','spell3','spell4','spell5'],
      incantations: ['spell1','spell2','spell3','spell4','spell5'],
      spirits:      ['item1','item2','item3','item4','item5','item6','item7','item8','item9','item10'],
    };

    const slots = slotMap[fav.category];
    if (!slots) return;
    const team = this.teamService.team() as any;
    const occ  = slots.find(s => team[s] === fav.api_id);
    occ ? this.removeSlot(occ) : this.addToSlots(fav.api_id, slots);
  }

  private addToSlots(apiId: string, slots: string[], category?: string): void {
    const team = { ...this.teamService.team() } as any;
    if (slots.some(s => team[s] === apiId)) return;
    const free = slots.find(s => !team[s]);
    if (!free) return;
    team[free] = apiId;
    this.teamService.team.set(team);
    this.teamService.saveTeam().subscribe();
    const fav = this.favoritesService.favorites().find(f => f.api_id === apiId);
    this.reloadItem(apiId, category ?? fav?.category ?? 'items');
  }

  private reloadItem(apiId: string, category: string): void {
    if (this.itemsData()[apiId]) return;
    this.getOneByCategory(category, apiId).subscribe({
      next: data => this.itemsData.update(d => ({ ...d, [apiId]: data })),
      error: () => {}
    });
  }

  isInTeam(apiId: string): boolean { return this.teamService.isInTeam(apiId); }

  getSlotItem(slot: string): any | null {
    const team  = this.teamService.team() as any;
    const apiId = team[slot];
    if (!apiId) return null;
    return this.itemsData()[apiId] ?? null;
  }

  removeSlot(slot: string): void {
    this.teamService.removeFromSlot(slot);
    this.teamService.saveTeam().subscribe();
  }

  saveActive(): void {
    if (!this.teamService.team().id_team) {
      this.noTeamMsg.set(true);
      setTimeout(() => this.noTeamMsg.set(false), 3000);
      return;
    }
    this.teamService.saveTeam().subscribe();
  }

  clearTeam(): void {
    const id = this.teamService.team().id_team;
    this.teamService.team.set({ ...EMPTY_TEAM, id_team: id });
    this.itemsData.set({});
  }

  // ── Gestión de equipos guardados ──────────────────────────────────────

  openSaveModal(): void {
    this.newTeamName = '';
    this.showSaveModal.set(true);
  }

  confirmSave(): void {
    if (!this.newTeamName.trim() || this.saving) return;
    this.saving = true;
    const name = this.newTeamName.trim();
    this.showSaveModal.set(false);

    // 1. Guarda el estado actual del equipo activo (si existe)
    // 2. Limpia el tablero localmente (sin id_team → no habrá auto-guardado)
    // 3. Crea el nuevo equipo vacío como activo en el backend
    this.teamService.saveTeam().subscribe({
      next: () => {
        this.teamService.team.set({ ...EMPTY_TEAM });
        this.itemsData.set({});

        this.teamService.saveTeamAs(name).subscribe({
          next: (res: any) => {
            this.teamService.team.update(t => ({
              ...t,
              id_team:   res.id_team,
              name,
              is_active: 1,
            }));
            this.teamService.loadAllTeams().subscribe();
            this.saving = false;
          },
          error: () => { this.saving = false; },
        });
      },
      error: () => { this.saving = false; },
    });
  }

  loadSaved(teamId: number): void {
    this.loaded.set(false);
    this.itemsData.set({});
    this.teamService.loadSavedTeam(teamId).subscribe({
      next: () => {
        this.loadItemsData();
        this.teamService.loadAllTeams().subscribe();
      }
    });
  }

  deleteSaved(teamId: number): void {
    this.teamService.deleteTeam(teamId).subscribe();
  }

  startRename(teamId: number, currentName: string): void {
    this.renamingId.set(teamId);
    this.renameValue = currentName;
  }

  confirmRename(teamId: number): void {
    const name = this.renameValue.trim();
    if (!name) { this.cancelRename(); return; }
    this.teamService.renameTeam(teamId, name).subscribe();
    this.renamingId.set(null);
  }

  cancelRename(): void {
    this.renamingId.set(null);
  }

  // ── Stats ─────────────────────────────────────────────────────────────

  private calcStat(type: string): number {
    let total = 0;
    for (const item of Object.values(this.itemsData())) {
      if (!item) continue;
      if (type === 'weight' && item.weight) total += parseFloat(item.weight);
      if (type === 'attack' && item.attack) item.attack.forEach((s: any) => { if (s.amount) total += s.amount; });
      if (type === 'defense' && item.defence) item.defence.forEach((s: any) => { if (s.amount) total += s.amount; });
      if (type === 'defense' && item.dmgNegation) item.dmgNegation.forEach((s: any) => { if (s.amount) total += s.amount; });
    }
    return Math.round(total * 10) / 10;
  }

  // ── Carga de datos ────────────────────────────────────────────────────

  private loadItemsData(): void {
    const team   = this.teamService.team() as any;
    const favMap: Record<string, string> = {};
    for (const fav of this.favoritesService.favorites()) favMap[fav.api_id] = fav.category;

    const requests: { [key: string]: Observable<any> } = {};
    for (const def of this.slotDefs) {
      const apiId = team[def.slot];
      if (apiId && !requests[apiId]) {
        const cat = favMap[apiId] ?? def.category;
        requests[apiId] = new Observable(observer => {
          this.getOneByCategory(cat, apiId).subscribe({
            next: val  => { observer.next(val);  observer.complete(); },
            error: ()  => { observer.next(null); observer.complete(); }
          });
        });
      }
    }

    if (Object.keys(requests).length === 0) { this.loaded.set(true); return; }

    forkJoin(requests).subscribe({
      next: results => { this.itemsData.set(results as Record<string, any>); this.loaded.set(true); },
      error: ()     => this.loaded.set(true)
    });
  }

  private getOneByCategory(category: string, id: string): Observable<any> {
    switch (category) {
      case 'weapons':      return this.apiService.getOneWeapon(id);
      case 'ammos':        return this.apiService.getOneAmmo(id);
      case 'armors':       return this.apiService.getOneArmor(id);
      case 'ashes':        return this.apiService.getOneAsh(id);
      case 'talismans':    return this.apiService.getOneTalisman(id);
      case 'items':        return this.apiService.getOneItem(id);
      case 'shields':      return this.apiService.getOneShield(id);
      case 'sorceries':    return this.apiService.getOneSorcery(id);
      case 'spirits':      return this.apiService.getOneSpirit(id);
      case 'incantations': return this.apiService.getOneIncantation(id);
      default:             return this.apiService.getOneItem(id);
    }
  }

  printTeam(): void { window.print(); }

  publishToBlog(): void {
    const id = this.teamService.team().id_team;
    if (!id) {
      this.noTeamMsg.set(true);
      setTimeout(() => this.noTeamMsg.set(false), 3000);
      return;
    }
    this.router.navigate(['/blog'], { queryParams: { team: id } });
  }
}
