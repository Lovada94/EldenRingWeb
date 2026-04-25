import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import {EldenRingApiService} from '../../../../services/eldenRingService';
import {Weapon} from '../../../../common/interface';
import {FavoritesService} from '../../../../services/favorite-service';
import {AuthService} from '../../../../services/authService';

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

  weapons     = signal<Weapon[]>([]);
  totalItems   = signal<number>(0);
  currentPage  = signal<number>(1);
  loaded       = signal<boolean>(false);
  searchTerm    = signal<string>('');

  selectedWeapon = signal<Weapon | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;

  private apiPage = computed(() => this.currentPage() - 1);

  readonly statIcons: Record<string, { label: string; emoji: string }> = {
    // Daño
    'Phy':   { label: 'Físi',  emoji: '⚔️' },
    'Mag':   { label: 'Mag',   emoji: '✨' },
    'Fire':  { label: 'Fue',   emoji: '🔥' },
    'Ligt':  { label: 'Rayo',  emoji: '⚡' },
    'Holy':  { label: 'Sagr',  emoji: '☀️' },
    'Crit':  { label: 'Crít',  emoji: '🎯' },
    'Rng':   { label: 'Rang',  emoji: '🏹' },
    'Boost': { label: 'Boost', emoji: '📈' },
    // Atributos
    'Str':   { label: 'Fuer',  emoji: '💪' },
    'Dex':   { label: 'Dest',  emoji: '🤸' },
    'Int':   { label: 'Int',   emoji: '📖' },
    'Fai':   { label: 'Fe',    emoji: '🙏' },
    'Arc':   { label: 'Arc',   emoji: '🌀' },
  };

  getStat(name: string): { label: string; emoji: string } {
    return this.statIcons[name] ?? { label: name, emoji: '•' };
  }

  ngOnInit(): void {
    this.loadWeapons();
  }

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

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadWeapons();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadWeapons();
  }

  openDetail(weapon: Weapon): void {
    this.selectedWeapon.set(weapon);
  }

  closeDetail(): void {
    this.selectedWeapon.set(null);
  }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'weapons');
  }

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
