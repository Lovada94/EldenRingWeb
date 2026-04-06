import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Spirit } from '../../../../common/interface';

@Component({
  selector: 'app-spirits',
  imports: [NgbPagination],
  templateUrl: './spirits.html',
  styleUrl: './spirits.css',
})
export class SpiritsPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);

  spirits         = signal<Spirit[]>([]);
  totalItems      = signal<number>(0);
  currentPage     = signal<number>(1);
  loaded          = signal<boolean>(false);
  searchTerm      = signal<string>('');
  selectedSpirit  = signal<Spirit | null>(null);

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  ngOnInit(): void {
    this.loadSpirits();
  }

  private loadSpirits(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getSpirits(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.spirits.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar espíritus:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadSpirits();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadSpirits();
  }

  openDetail(spirit: Spirit): void { this.selectedSpirit.set(spirit); }
  closeDetail(): void { this.selectedSpirit.set(null); }
}
