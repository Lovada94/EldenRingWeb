import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Shield } from '../../../../common/interface';
import { FavoritesService } from '../../../../services/favorite-service';
import { AuthService } from '../../../../services/authService';

@Component({
  selector: 'app-shields',
  imports: [NgbPagination],
  templateUrl: './shields.html',
  styleUrl: './shields.css',
})
export class ShieldsPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);
  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  shields         = signal<Shield[]>([]);
  totalItems      = signal<number>(0);
  currentPage     = signal<number>(1);
  loaded          = signal<boolean>(false);
  searchTerm      = signal<string>('');
  selectedShield  = signal<Shield | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  readonly statIcons: Record<string, { label: string; emoji: string }> = {
    'Phy':   { label: 'Físi',  emoji: '⚔️' },
    'Mag':   { label: 'Mag',   emoji: '✨' },
    'Fire':  { label: 'Fue',   emoji: '🔥' },
    'Ligt':  { label: 'Rayo',  emoji: '⚡' },
    'Holy':  { label: 'Sagr',  emoji: '☀️' },
    'Crit':  { label: 'Crít',  emoji: '🎯' },
    'Rng':   { label: 'Rang',  emoji: '🏹' },
    'Boost': { label: 'Boost', emoji: '📈' },
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
    this.loadShields();
  }

  private loadShields(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getShields(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.shields.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar escudos:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadShields();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadShields();
  }

  openDetail(shield: Shield): void { this.selectedShield.set(shield); }
  closeDetail(): void { this.selectedShield.set(null); }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'shields');
  }

  toggleFav(shield: Shield): void {
    if (!this.isLogged()) return;
    this.favoritesService.toggleFavorite({
      api_id: shield.id,
      category: 'shields',
      name: shield.name,
      image: shield.image
    }).subscribe();
  }
}
