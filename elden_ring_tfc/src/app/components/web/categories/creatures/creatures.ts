import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Creature } from '../../../../common/interface';
import { FavoritesService } from '../../../../services/favorite-service';
import { AuthService } from '../../../../services/authService';

@Component({
  selector: 'app-creatures',
  imports: [NgbPagination],
  templateUrl: './creatures.html',
  styleUrl: './creatures.css',
})
export class CreaturesPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);
  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  creatures         = signal<Creature[]>([]);
  totalItems        = signal<number>(0);
  currentPage       = signal<number>(1);
  loaded            = signal<boolean>(false);
  searchTerm        = signal<string>('');
  selectedCreature  = signal<Creature | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  ngOnInit(): void {
    this.loadCreatures();
  }

  private loadCreatures(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getCreatures(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.creatures.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar criaturas:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadCreatures();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadCreatures();
  }

  openDetail(creature: Creature): void { this.selectedCreature.set(creature); }
  closeDetail(): void { this.selectedCreature.set(null); }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'creatures');
  }

  toggleFav(creature: Creature): void {
    if (!this.isLogged()) return;
    this.favoritesService.toggleFavorite({
      api_id: creature.id,
      category: 'creatures',
      name: creature.name,
      image: creature.image
    }).subscribe();
  }
}
