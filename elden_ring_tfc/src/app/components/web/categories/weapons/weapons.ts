import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import {EldenRingApiService} from '../../../../services/eldenRingService';
import {Weapon} from '../../../../common/interface';
import {FavoritesService} from '../../../../services/favoritesService';
import {AuthService} from '../../../../services/authService';

/* Página de armas: lista paginada con búsqueda, detalle en modal y gestión de favoritos */
@Component({
  selector: 'app-weapons',
  imports: [
    NgbPagination,
  ],
  templateUrl: './weapons.html',
  styleUrl: './weapons.css',
})
export class WeaponsPage implements OnInit {

  private readonly apiService: EldenRingApiService = inject(EldenRingApiService);

  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  /* Lista de armas de la página actual */
  weapons     = signal<Weapon[]>([]);

  /* Total de armas disponibles en la API (para la paginación) */
  totalItems   = signal<number>(0);
  currentPage  = signal<number>(1);

  /* Indica si la petición a la API ha terminado */
  loaded       = signal<boolean>(false);
  searchTerm    = signal<string>('');

  /* Arma seleccionada para mostrar en el modal de detalle */
  selectedWeapon = signal<Weapon | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;

  /* Página base 0 que espera la API (la paginación de Bootstrap usa base 1) */
  private apiPage = computed(() => this.currentPage() - 1);

  /* Iconos y etiquetas en español para cada stat mostrado en el detalle del arma */
  readonly statIcons: Record<string, { label: string; emoji: string }> = {
    /* Daño */
    'Phy':   { label: 'Físi',  emoji: '⚔️' },
    'Mag':   { label: 'Mag',   emoji: '✨' },
    'Fire':  { label: 'Fue',   emoji: '🔥' },
    'Ligt':  { label: 'Rayo',  emoji: '⚡' },
    'Holy':  { label: 'Sagr',  emoji: '☀️' },
    'Crit':  { label: 'Crít',  emoji: '🎯' },
    'Rng':   { label: 'Rang',  emoji: '🏹' },
    'Boost': { label: 'Boost', emoji: '📈' },
    /* Atributos */
    'Str':   { label: 'Fuer',  emoji: '💪' },
    'Dex':   { label: 'Dest',  emoji: '🤸' },
    'Int':   { label: 'Int',   emoji: '📖' },
    'Fai':   { label: 'Fe',    emoji: '🙏' },
    'Arc':   { label: 'Arc',   emoji: '🌀' },
  };

  /* Obtener el icono y etiqueta de una stat por nombre, con fallback genérico */
  getStat(name: string): { label: string; emoji: string } {
    return this.statIcons[name] ?? { label: name, emoji: '•' };
  }

  ngOnInit(): void {
    this.loadWeapons();
  }

  /* Cargar la página actual de armas desde la API con el filtro de búsqueda activo */
  private loadWeapons(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;

    this.apiService.getWeapons(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.weapons.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar armas:', err);
        this.loaded.set(true);
      }
    });
  }

  /* Cambiar de página y hacer scroll al inicio */
  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadWeapons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* Actualizar el término de búsqueda y volver a la primera página */
  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadWeapons();
  }

  /* Abrir el modal de detalle con el arma seleccionada */
  openDetail(weapon: Weapon): void {
    this.selectedWeapon.set(weapon);
  }

  /* Cerrar el modal de detalle */
  closeDetail(): void {
    this.selectedWeapon.set(null);
  }

  /* Comprobar si un arma ya está en favoritos */
  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'weapons');
  }

  /* Alternar el estado de favorito del arma para el usuario autenticado */
  toggleFav(weapon: Weapon): void {
    if (!this.isLogged()) return;

    this.favoritesService.toggleFavorite({
      api_id: weapon.id,
      category: 'weapons',
      name: weapon.name,
      image: weapon.image
    }).subscribe();
  }

}
