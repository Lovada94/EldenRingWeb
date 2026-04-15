import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Ash } from '../../../../common/interface';

@Component({
  selector: 'app-ashes',
  imports: [NgbPagination],
  templateUrl: './ashes.html',
  styleUrl: './ashes.css',
})
export class AshesPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);

  ashes       = signal<Ash[]>([]);
  totalItems  = signal<number>(0);
  currentPage = signal<number>(1);
  loaded      = signal<boolean>(false);
  searchTerm  = signal<string>('');
  selectedAsh = signal<Ash | null>(null);

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  ngOnInit(): void {
    this.loadAshes();
  }

  private loadAshes(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getAshes(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.ashes.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar cenizas de guerra:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadAshes();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadAshes();
  }

  openDetail(ash: Ash): void { this.selectedAsh.set(ash); }
  closeDetail(): void { this.selectedAsh.set(null); }
}
