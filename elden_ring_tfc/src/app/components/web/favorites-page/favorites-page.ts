import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FavoritesService} from '../../../services/favoritesService';
import { EldenRingApiService } from '../../../services/eldenRingService';
import { RouterLink } from '@angular/router';
import {Observable} from 'rxjs';
import {TeamService} from '../../../services/teamService';
import {Favorite} from '../../../common/interface';

const NO_TEAM_CATEGORIES = ['locations', 'bosses', 'classes', 'npcs'];

const QUEST_STATUSES = [
  { value: 'pending',     label: 'Sin empezar', emoji: '⭕' },
  { value: 'in_progress', label: 'En proceso',  emoji: '🔄' },
  { value: 'completed',   label: 'Completada',  emoji: '✅' },
];

const CATEGORY_LABELS: Record<string, string> = {
  weapons:      'Armas',
  ammos:        'Munición',
  armors:       'Armaduras',
  ashes:        'Cenizas de Guerra',
  bosses:       'Jefes',
  classes:      'Clases',
  creatures:    'Criaturas',
  incantations: 'Incantaciones',
  items:        'Objetos',
  locations:    'Ubicaciones',
  npcs:         'NPCs',
  shields:      'Escudos',
  sorceries:    'Hechizos',
  spirits:      'Espíritus',
  talismans:    'Talismanes',
};

@Component({
  selector: 'app-favorites-page',
  imports: [RouterLink],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.css',
})
export class FavoritesPage implements OnInit {

  private readonly favoritesService = inject(FavoritesService);
  private readonly apiService       = inject(EldenRingApiService);
  protected readonly teamService: TeamService = inject(TeamService);

  loaded        = signal<boolean>(false);
  loadingDetail = signal<boolean>(false);
  selectedItem  = signal<any | null>(null);
  selectedFav   = signal<Favorite | null>(null);

  questStatuses = QUEST_STATUSES;

  groupedFavorites = computed(() => {
    const groups: Record<string, Favorite[]> = {};
    for (const fav of this.favoritesService.favorites()) {
      if (!groups[fav.category]) groups[fav.category] = [];
      groups[fav.category].push(fav);
    }
    return groups;
  });

  categories = computed(() => Object.keys(this.groupedFavorites()).sort());

  ngOnInit(): void {
    this.favoritesService.loadFavorites().subscribe({
      next: () => this.loaded.set(true),
      error: () => this.loaded.set(true)
    });
    this.teamService.loadTeam().subscribe();
  }

  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  hasTeamButton(category: string): boolean {
    return !NO_TEAM_CATEGORIES.includes(category);
  }

  getQuestStatus(fav: Favorite): string {
    return (fav as any).quest_status ?? 'pending';
  }

  removeFavorite(fav: Favorite): void {
    this.favoritesService.removeFavorite(fav.api_id, fav.category).subscribe();
  }

  updateQuestStatus(fav: Favorite, status: string): void {
    (fav as any).quest_status = status;
  }

  // ── Modal de detalle ──────────────────────────────────────────────────────

  openDetail(fav: Favorite): void {
    this.selectedFav.set(fav);
    this.loadingDetail.set(true);
    this.selectedItem.set(null);

    this.getOneByCategory(fav.category, fav.api_id).subscribe({
      next: (item) => {
        this.selectedItem.set(item);
        this.loadingDetail.set(false);
      },
      error: () => this.loadingDetail.set(false)
    });
  }

  closeDetail(): void {
    this.selectedItem.set(null);
    this.selectedFav.set(null);
  }

  addToTeam(fav: Favorite): void {
    const added = this.teamService.addToTeam(fav.api_id, fav.category);
    if (added) {
      this.teamService.saveTeam().subscribe();
      // opcional: mostrar mensaje de éxito
    } else {
      // opcional: mostrar mensaje de que no hay slots libres o ya está en el equipo
    }
  }

  private getOneByCategory(category: string, id: string): Observable<any> {
    switch (category) {
      case 'weapons':      return this.apiService.getOneWeapon(id);
      case 'ammos':        return this.apiService.getOneAmmo(id);
      case 'armors':       return this.apiService.getOneArmor(id);
      case 'ashes':        return this.apiService.getOneAsh(id);
      case 'bosses':       return this.apiService.getOneBoss(id);
      case 'classes':      return this.apiService.getOneClass(id);
      case 'creatures':    return this.apiService.getOneCreature(id);
      case 'incantations': return this.apiService.getOneIncantation(id);
      case 'items':        return this.apiService.getOneItem(id);
      case 'locations':    return this.apiService.getOneLocation(id);
      case 'npcs':         return this.apiService.getOneNpc(id);
      case 'shields':      return this.apiService.getOneShield(id);
      case 'sorceries':    return this.apiService.getOneSorcery(id);
      case 'spirits':      return this.apiService.getOneSpirit(id);
      case 'talismans':    return this.apiService.getOneTalisman(id);
      default:             return this.apiService.getOneWeapon(id);
    }
  }

  getDetailFields(item: any): { label: string; value: any }[] {
    const fields: { label: string; value: any }[] = [];
    if (item.description)  fields.push({ label: 'Descripción', value: item.description });
    if (item.category)     fields.push({ label: 'Categoría',   value: item.category });
    if (item.weight)       fields.push({ label: 'Peso',        value: item.weight });
    if (item.type)         fields.push({ label: 'Tipo',        value: item.type });
    if (item.effect)       fields.push({ label: 'Efecto',      value: item.effect });
    if (item.effects)      fields.push({ label: 'Efectos',     value: item.effects });
    if (item.affinity)     fields.push({ label: 'Afinidad',    value: item.affinity });
    if (item.skill)        fields.push({ label: 'Habilidad',   value: item.skill });
    if (item.location)     fields.push({ label: 'Ubicación',   value: item.location });
    if (item.region)       fields.push({ label: 'Región',      value: item.region });
    if (item.role)         fields.push({ label: 'Rol',         value: item.role });
    if (item.quote)        fields.push({ label: 'Cita',        value: item.quote });
    if (item.fpCost)       fields.push({ label: 'Coste FP',    value: item.fpCost });
    if (item.hpCost)       fields.push({ label: 'Coste HP',    value: item.hpCost });
    if (item.cost)         fields.push({ label: 'Coste',       value: item.cost });
    if (item.slots)        fields.push({ label: 'Ranuras',     value: item.slots });
    if (item.healthPoints) fields.push({ label: 'Vida',        value: item.healthPoints });
    if (item.passive)      fields.push({ label: 'Pasivo',      value: item.passive });
    return fields;
  }

}
