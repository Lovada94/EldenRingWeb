import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Talisman } from '../../../../common/interface';
import { FavoritesService } from '../../../../services/favorite-service';
import { AuthService } from '../../../../services/authService';

@Component({
  selector: 'app-talismans',
  imports: [NgbPagination],
  templateUrl: './talismans.html',
  styleUrl: './talismans.css',
})
export class TalismansPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);
  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  talismans         = signal<Talisman[]>([]);
  totalItems        = signal<number>(0);
  currentPage       = signal<number>(1);
  loaded            = signal<boolean>(false);
  searchTerm        = signal<string>('');
  selectedTalisman  = signal<Talisman | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  ngOnInit(): void {
    this.loadTalismans();
  }

  private loadTalismans(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getTalismans(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.talismans.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar talismanes:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadTalismans();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadTalismans();
  }

  openDetail(talisman: Talisman): void { this.selectedTalisman.set(talisman); }
  closeDetail(): void { this.selectedTalisman.set(null); }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'talismans');
  }

  toggleFav(talisman: Talisman): void {
    if (!this.isLogged()) return;
    this.favoritesService.toggleFavorite({
      api_id: talisman.id,
      category: 'talismans',
      name: talisman.name,
      image: talisman.image
    }).subscribe();
  }
}
