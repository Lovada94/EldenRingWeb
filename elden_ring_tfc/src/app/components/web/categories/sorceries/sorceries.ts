import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Sorcery } from '../../../../common/interface';
import { FavoritesService } from '../../../../services/favorite-service';
import { AuthService } from '../../../../services/authService';

@Component({
  selector: 'app-sorceries',
  imports: [NgbPagination],
  templateUrl: './sorceries.html',
  styleUrl: './sorceries.css',
})
export class SorceriesPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);
  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  sorceries         = signal<Sorcery[]>([]);
  totalItems        = signal<number>(0);
  currentPage       = signal<number>(1);
  loaded            = signal<boolean>(false);
  searchTerm        = signal<string>('');
  selectedSorcery   = signal<Sorcery | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  readonly statIcons: Record<string, { label: string; emoji: string }> = {
    'Intelligence': { label: 'Int',    emoji: '📖' },
    'Faith':        { label: 'Fe',     emoji: '🙏' },
    'Arcane':       { label: 'Arc',    emoji: '🌀' },
  };

  getStat(name: string): { label: string; emoji: string } {
    return this.statIcons[name] ?? { label: name, emoji: '•' };
  }

  ngOnInit(): void {
    this.loadSorceries();
  }

  private loadSorceries(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getSorceries(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.sorceries.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar sortilegios:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadSorceries();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadSorceries();
  }

  openDetail(sorcery: Sorcery): void { this.selectedSorcery.set(sorcery); }
  closeDetail(): void { this.selectedSorcery.set(null); }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'sorceries');
  }

  toggleFav(sorcery: Sorcery): void {
    if (!this.isLogged()) return;
    this.favoritesService.toggleFavorite({
      api_id: sorcery.id,
      category: 'sorceries',
      name: sorcery.name,
      image: sorcery.image
    }).subscribe();
  }
}
