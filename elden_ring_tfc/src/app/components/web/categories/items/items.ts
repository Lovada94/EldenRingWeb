import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Item } from '../../../../common/interface';
import { FavoritesService } from '../../../../services/favorite-service';
import { AuthService } from '../../../../services/authService';

@Component({
  selector: 'app-items',
  imports: [NgbPagination],
  templateUrl: './items.html',
  styleUrl: './items.css',
})
export class ItemsPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);
  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  items        = signal<Item[]>([]);
  totalItems   = signal<number>(0);
  currentPage  = signal<number>(1);
  loaded       = signal<boolean>(false);
  searchTerm   = signal<string>('');
  selectedItem = signal<Item | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getItems(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.items.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar objetos:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadItems();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadItems();
  }

  openDetail(item: Item): void { this.selectedItem.set(item); }
  closeDetail(): void { this.selectedItem.set(null); }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'items');
  }

  toggleFav(item: Item): void {
    if (!this.isLogged()) return;
    this.favoritesService.toggleFavorite({
      api_id: item.id,
      category: 'items',
      name: item.name,
      image: item.image
    }).subscribe();
  }
}
