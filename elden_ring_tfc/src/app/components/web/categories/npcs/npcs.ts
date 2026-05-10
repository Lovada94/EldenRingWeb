import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Npc } from '../../../../common/interface';
import { FavoritesService } from '../../../../services/favoritesService';
import { AuthService } from '../../../../services/authService';

@Component({
  selector: 'app-npcs',
  imports: [NgbPagination],
  templateUrl: './npcs.html',
  styleUrl: './npcs.css',
})
export class NpcsPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);
  private readonly favoritesService: FavoritesService = inject(FavoritesService);
  private readonly authService: AuthService = inject(AuthService);

  npcs        = signal<Npc[]>([]);
  totalItems  = signal<number>(0);
  currentPage = signal<number>(1);
  loaded      = signal<boolean>(false);
  searchTerm  = signal<string>('');
  selectedNpc = signal<Npc | null>(null);

  isLogged = computed(() => this.authService.isLogged());

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  ngOnInit(): void {
    this.loadNpcs();
  }

  private loadNpcs(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getNpcs(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.npcs.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar NPCs:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadNpcs();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadNpcs();
  }

  openDetail(npc: Npc): void { this.selectedNpc.set(npc); }
  closeDetail(): void { this.selectedNpc.set(null); }

  isFav(apiId: string): boolean {
    return this.favoritesService.isFavorite(apiId, 'npcs');
  }

  toggleFav(npc: Npc): void {
    if (!this.isLogged()) return;
    this.favoritesService.toggleFavorite({
      api_id: npc.id,
      category: 'npcs',
      name: npc.name,
      image: npc.image
    }).subscribe();
  }
}
