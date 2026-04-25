import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Incantation } from '../../../../common/interface';
import { FavoritesService } from '../../../../services/favorite-service';
import { AuthService } from '../../../../services/authService';

@Component({
  selector: 'app-incantations',
  imports: [NgbPagination],
  templateUrl: './incantations.html',
  styleUrl: './incantations.css',
})
export class IncantationsPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);
  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  incantations         = signal<Incantation[]>([]);
  totalItems           = signal<number>(0);
  currentPage          = signal<number>(1);
  loaded               = signal<boolean>(false);
  searchTerm           = signal<string>('');
  selectedIncantation  = signal<Incantation | null>(null);

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
    this.loadIncantations();
  }

  private loadIncantations(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getIncantations(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.incantations.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar incantaciones:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadIncantations();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadIncantations();
  }

  openDetail(incantation: Incantation): void { this.selectedIncantation.set(incantation); }
  closeDetail(): void { this.selectedIncantation.set(null); }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'incantations');
  }

  toggleFav(incantation: Incantation): void {
    if (!this.isLogged()) return;
    this.favoritesService.toggleFavorite({
      api_id: incantation.id,
      category: 'incantations',
      name: incantation.name,
      image: incantation.image
    }).subscribe();
  }
}
