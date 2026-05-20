import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FavoritesService} from '../../../services/favoritesService';
import { EldenRingApiService } from '../../../services/eldenRingService';
import { RouterLink } from '@angular/router';
import {Observable} from 'rxjs';
import {Favorite} from '../../../common/interface';

/* Estados posibles del seguimiento de misiones asociado a cada favorito */
const QUEST_STATUSES = [
  { value: 'pending',     label: 'Sin empezar', emoji: '⭕' },
  { value: 'in_progress', label: 'En proceso',  emoji: '🔄' },
  { value: 'completed',   label: 'Completada',  emoji: '✅' },
];

/* Etiquetas en español para cada categoría de favoritos */
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

  /* Indica si los favoritos han terminado de cargarse desde el backend */
  loaded        = signal<boolean>(false);

  /* Indica si el detalle de un ítem está siendo cargado desde la API externa */
  loadingDetail = signal<boolean>(false);

  /* Ítem seleccionado cuyo detalle se muestra en el modal */
  selectedItem  = signal<any | null>(null);

  /* Favorito seleccionado, necesario para mostrar controles en el modal */
  selectedFav   = signal<Favorite | null>(null);

  questStatuses = QUEST_STATUSES;

  /* Favoritos del usuario agrupados por categoría para renderizar las secciones */
  groupedFavorites = computed(() => {
    const groups: Record<string, Favorite[]> = {};
    for (const fav of this.favoritesService.favorites()) {
      if (!groups[fav.category]) groups[fav.category] = [];
      groups[fav.category].push(fav);
    }
    return groups;
  });

  /* Lista ordenada de categorías presentes en los favoritos del usuario */
  categories = computed(() => Object.keys(this.groupedFavorites()).sort());

  ngOnInit(): void {
    this.favoritesService.loadFavorites().subscribe({
      next: () => this.loaded.set(true),
      error: () => this.loaded.set(true)
    });
  }

  /* Obtener la etiqueta en español de una categoría */
  getCategoryLabel(category: string): string {
    return CATEGORY_LABELS[category] ?? category;
  }

  /* Obtener el estado de quest del favorito (campo extendido, no guardado en backend) */
  getQuestStatus(fav: Favorite): string {
    return (fav as any).quest_status ?? 'pending';
  }

  /* Eliminar un favorito de la lista del usuario */
  removeFavorite(fav: Favorite): void {
    this.favoritesService.removeFavorite(fav.api_id, fav.category).subscribe();
  }

  /* Actualizar el estado de quest de un favorito en memoria */
  updateQuestStatus(fav: Favorite, status: string): void {
    (fav as any).quest_status = status;
  }

  /* Modal de detalle */

  /* Abrir el modal de detalle y cargar los datos del ítem desde la API */
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

  /* Cerrar el modal de detalle y limpiar el ítem seleccionado */
  closeDetail(): void {
    this.selectedItem.set(null);
    this.selectedFav.set(null);
  }

  /* Seleccionar el método de la API adecuado según la categoría del favorito */
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

  /* Extraer los campos relevantes del ítem para mostrarlos en el modal de detalle */
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
