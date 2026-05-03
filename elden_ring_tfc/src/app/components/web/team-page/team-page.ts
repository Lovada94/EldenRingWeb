import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { TeamService, EMPTY_TEAM } from '../../../services/teamService';
import { FavoritesService} from '../../../services/favoritesService';
import { EldenRingApiService } from '../../../services/eldenRingService';
import { forkJoin, Observable } from 'rxjs';
import {Favorite} from '../../../common/interface';

// Categorías permitidas en el equipo
const TEAM_CATEGORIES = ['weapons', 'shields', 'ammos', 'armors', 'talismans', 'items', 'ashes', 'sorceries', 'incantations', 'spirits'];

// Mapa de categoría de armadura a slot
const ARMOR_SLOT: Record<string, string> = {
  'Helm':       'armor_head',
  'Head Armor': 'armor_head',
  'Chest Armor':'armor_chest',
  'Gauntlets':  'armor_hands',
  'Leg Armor':  'armor_legs',
};

const CATEGORY_LABELS: Record<string, string> = {
  weapons: 'Armas', shields: 'Escudos', ammos: 'Munición',
  armors: 'Armaduras', talismans: 'Talismanes', items: 'Objetos',
  ashes: 'Cenizas', sorceries: 'Hechizos', incantations: 'Incantaciones', spirits: 'Espíritus',
};

@Component({
  selector: 'app-team-page',
  imports: [],
  templateUrl: './team-page.html',
  styleUrl: './team-page.css',
})
export class TeamPage implements OnInit {

  protected readonly teamService      = inject(TeamService);
  private readonly favoritesService   = inject(FavoritesService);
  private readonly apiService         = inject(EldenRingApiService);

  loaded    = signal<boolean>(false);
  itemsData = signal<Record<string, any>>({});

  // Favoritos filtrados — solo los que se pueden añadir al equipo
  teamFavorites = computed(() =>
    this.favoritesService.favorites().filter(f => TEAM_CATEGORIES.includes(f.category))
  );

  // Favoritos agrupados por categoría
  groupedFavorites = computed(() => {
    const groups: Record<string, Favorite[]> = {};
    for (const fav of this.teamFavorites()) {
      if (!groups[fav.category]) groups[fav.category] = [];
      groups[fav.category].push(fav);
    }
    return groups;
  });

  categories = computed(() => Object.keys(this.groupedFavorites()).sort());

  // Slots para el listado y previsualización
  readonly slotDefs: { slot: string; label: string; category: string }[] = [
    { slot: 'weapon_r1', label: 'Arma D1', category: 'weapons' },
    { slot: 'weapon_r2', label: 'Arma D2', category: 'weapons' },
    { slot: 'weapon_r3', label: 'Arma D3', category: 'weapons' },
    { slot: 'weapon_l1', label: 'Arma I1', category: 'weapons' },
    { slot: 'weapon_l2', label: 'Arma I2', category: 'weapons' },
    { slot: 'weapon_l3', label: 'Arma I3', category: 'weapons' },
    { slot: 'arrow1', label: 'Flecha 1', category: 'ammos' },
    { slot: 'arrow2', label: 'Flecha 2', category: 'ammos' },
    { slot: 'bolt1',  label: 'Saeta 1',  category: 'ammos' },
    { slot: 'bolt2',  label: 'Saeta 2',  category: 'ammos' },
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
  ];

  totalWeight  = computed(() => this.calcStat('weight'));
  totalAttack  = computed(() => this.calcStat('attack'));
  totalDefense = computed(() => this.calcStat('defense'));

  ngOnInit(): void {
    const favs = this.favoritesService.favorites();
    if (favs.length > 0) {
      this.teamService.loadTeam().subscribe({
        next: () => this.loadItemsData(),
        error: () => this.loaded.set(true)
      });
    } else {
      this.favoritesService.loadFavorites().subscribe({
        next: () => {
          this.teamService.loadTeam().subscribe({
            next: () => this.loadItemsData(),
            error: () => this.loaded.set(true)
          });
        }
      });
    }
  }

  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  // ── Añadir al equipo ─────────────────────────────────────────────────

  isWeaponOrShield(category: string): boolean {
    return category === 'weapons' || category === 'shields';
  }

  addRight(fav: Favorite): void {
    const slots = ['weapon_r1', 'weapon_r2', 'weapon_r3'];
    const team = this.teamService.team() as any;
    const occupied = slots.find(s => team[s] === fav.api_id);
    if (occupied) {
      this.removeSlot(occupied);
      return;
    }
    this.addToSlots(fav.api_id, slots, fav.category);
  }

  addLeft(fav: Favorite): void {
    const slots = ['weapon_l1', 'weapon_l2', 'weapon_l3'];
    const team = this.teamService.team() as any;
    const occupied = slots.find(s => team[s] === fav.api_id);
    if (occupied) {
      this.removeSlot(occupied);
      return;
    }
    this.addToSlots(fav.api_id, slots, fav.category);
  }

  isInRightHand(apiId: string): boolean {
    const team = this.teamService.team() as any;
    return ['weapon_r1','weapon_r2','weapon_r3'].some(s => team[s] === apiId);
  }

  isInLeftHand(apiId: string): boolean {
    const team = this.teamService.team() as any;
    return ['weapon_l1','weapon_l2','weapon_l3'].some(s => team[s] === apiId);
  }

  addGeneric(fav: Favorite): void {
    if (fav.category === 'armors') {
      const slot = ARMOR_SLOT[fav.subcategory ?? ''];
      if (!slot) return;
      const team = { ...this.teamService.team() } as any;
      if (team[slot] === fav.api_id) {
        this.removeSlot(slot);
        return;
      }
      team[slot] = fav.api_id;
      this.teamService.team.set(team);
      this.teamService.saveTeam().subscribe();
      this.reloadItem(fav.api_id, fav.category);
      return;
    }

    if (fav.category === 'ammos') {
      const sub = (fav.subcategory ?? fav.name).toLowerCase();
      const isBolt = sub.includes('bolt');
      const slots = isBolt ? ['bolt1', 'bolt2'] : ['arrow1', 'arrow2'];
      const team = this.teamService.team() as any;
      const occupied = slots.find(s => team[s] === fav.api_id);
      if (occupied) {
        this.removeSlot(occupied);
        return;
      }
      this.addToSlots(fav.api_id, slots);
      return;
    }

    const slotMap: Record<string, string[]> = {
      ammos:        ['arrow1', 'arrow2', 'bolt1', 'bolt2'],
      talismans:    ['talisman1', 'talisman2', 'talisman3', 'talisman4'],
      items:        ['item1','item2','item3','item4','item5','item6','item7','item8','item9','item10'],
      ashes:        ['weapon_r1','weapon_r2','weapon_r3','weapon_l1','weapon_l2','weapon_l3'],
      sorceries:    ['item1','item2','item3','item4','item5','item6','item7','item8','item9','item10'],
      incantations: ['item1','item2','item3','item4','item5','item6','item7','item8','item9','item10'],
      spirits:      ['item1','item2','item3','item4','item5','item6','item7','item8','item9','item10'],
    };

    const slots = slotMap[fav.category];
    if (!slots) return;

    const team = this.teamService.team() as any;
    const occupied = slots.find(s => team[s] === fav.api_id);
    if (occupied) {
      this.removeSlot(occupied);
      return;
    }
    this.addToSlots(fav.api_id, slots);
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
    const cat = category ?? fav?.category ?? 'weapons';
    this.reloadItem(apiId, cat);
  }

  private reloadItem(apiId: string, category: string): void {
    if (this.itemsData()[apiId]) return;
    this.getOneByCategory(category, apiId).subscribe({
      next: (data) => this.itemsData.update(d => ({ ...d, [apiId]: data })),
      error: () => {}
    });
  }

  isInTeam(apiId: string): boolean {
    return this.teamService.isInTeam(apiId);
  }

  // ── Previsualización ──────────────────────────────────────────────────

  getSlotItem(slot: string): any | null {
    const team = this.teamService.team() as any;
    const apiId = team[slot];
    if (!apiId) return null;
    return this.itemsData()[apiId] ?? null;
  }

  getSlotLabel(slot: string): string {
    return this.slotDefs.find(d => d.slot === slot)?.label ?? slot;
  }

  removeSlot(slot: string): void {
    this.teamService.removeFromSlot(slot);
    this.teamService.saveTeam().subscribe();
  }

  clearTeam(): void {
    this.teamService.team.set({ ...EMPTY_TEAM });
    this.teamService.saveTeam().subscribe();
    this.itemsData.set({});
  }

  // ── Estadísticas ──────────────────────────────────────────────────────

  private calcStat(type: string): number {
    let total = 0;
    const data = this.itemsData();
    for (const item of Object.values(data)) {
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
    const team = this.teamService.team() as any;
    const favMap: Record<string, string> = {};
    for (const fav of this.favoritesService.favorites()) {
      favMap[fav.api_id] = fav.category;
    }

    const requests: { [key: string]: Observable<any> } = {};

    for (const def of this.slotDefs) {
      const apiId = team[def.slot];
      if (apiId && !requests[apiId]) {
        const category = favMap[apiId] ?? def.category;
        requests[apiId] = new Observable(observer => {
          this.getOneByCategory(category, apiId).subscribe({
            next: (val) => { observer.next(val); observer.complete(); },
            error: () => { observer.next(null); observer.complete(); }
          });
        });
      }
    }

    if (Object.keys(requests).length === 0) {
      this.loaded.set(true);
      return;
    }

    forkJoin(requests).subscribe({
      next: (results) => {
        this.itemsData.set(results as Record<string, any>);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true)
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

  // ── Imprimir ──────────────────────────────────────────────────────────

  printTeam(): void {
    window.print();
  }
}
