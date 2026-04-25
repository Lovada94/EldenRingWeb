import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Boss } from '../../../../common/interface';
import { FavoritesService } from '../../../../services/favoritesService';
import { AuthService } from '../../../../services/authService';

@Component({
  selector: 'app-bosses',
  imports: [NgbPagination],
  templateUrl: './bosses.html',
  styleUrl: './bosses.css',
})
export class BossesPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);
  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  bosses       = signal<Boss[]>([]);
  totalItems   = signal<number>(0);
  currentPage  = signal<number>(1);
  loaded       = signal<boolean>(false);
  searchTerm   = signal<string>('');
  selectedBoss = signal<Boss | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  ngOnInit(): void {
    this.loadBosses();
  }

  private loadBosses(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getBosses(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.bosses.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar jefes:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadBosses();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadBosses();
  }

  openDetail(boss: Boss): void { this.selectedBoss.set(boss); }
  closeDetail(): void { this.selectedBoss.set(null); }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'bosses');
  }

  toggleFav(boss: Boss): void {
    if (!this.isLogged()) return;
    this.favoritesService.toggleFavorite({
      api_id: boss.id,
      category: 'bosses',
      name: boss.name,
      image: boss.image
    }).subscribe();
  }
}
