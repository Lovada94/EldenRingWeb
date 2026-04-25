import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Ammo } from '../../../../common/interface';
import { FavoritesService } from '../../../../services/favoritesService';
import { AuthService } from '../../../../services/authService';

@Component({
  selector: 'app-ammos',
  imports: [NgbPagination],
  templateUrl: './ammos.html',
  styleUrl: './ammos.css',
})
export class AmmosPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);
  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  ammos        = signal<Ammo[]>([]);
  totalItems   = signal<number>(0);
  currentPage  = signal<number>(1);
  loaded       = signal<boolean>(false);
  searchTerm   = signal<string>('');
  selectedAmmo = signal<Ammo | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  readonly statIcons: Record<string, { label: string; emoji: string }> = {
    'physical':  { label: 'Físi',  emoji: '⚔️' },
    'magic':     { label: 'Mag',   emoji: '✨' },
    'fire':      { label: 'Fue',   emoji: '🔥' },
    'lightning': { label: 'Rayo',  emoji: '⚡' },
    'holy':      { label: 'Sagr',  emoji: '☀️' },
    'critical':  { label: 'Crít',  emoji: '🎯' },
  };

  getStat(name: string): { label: string; emoji: string } {
    return this.statIcons[name] ?? { label: name, emoji: '•' };
  }

  ngOnInit(): void {
    this.loadAmmos();
  }

  private loadAmmos(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getAmmos(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.ammos.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar munición:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadAmmos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadAmmos();
  }

  openDetail(ammo: Ammo): void { this.selectedAmmo.set(ammo); }
  closeDetail(): void { this.selectedAmmo.set(null); }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'ammos');
  }

  toggleFav(ammo: Ammo): void {
    if (!this.isLogged()) return;
    this.favoritesService.toggleFavorite({
      api_id: ammo.id,
      category: 'ammos',
      name: ammo.name,
      image: ammo.image
    }).subscribe();
  }
}
