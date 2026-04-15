import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { EldenLocation } from '../../../../common/interface';

@Component({
  selector: 'app-locations',
  imports: [NgbPagination],
  templateUrl: './locations.html',
  styleUrl: './locations.css',
})
export class LocationsPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);

  locations        = signal<EldenLocation[]>([]);
  totalItems             = signal<number>(0);
  currentPage            = signal<number>(1);
  loaded                = signal<boolean>(false);
  searchTerm              = signal<string>('');
  selectedLocation  = signal<EldenLocation | null>(null);

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  ngOnInit(): void {
    this.loadLocations();
  }

  private loadLocations(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getLocations(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.locations.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar localizaciones:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadLocations();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadLocations();
  }

  openDetail(location: EldenLocation): void { this.selectedLocation.set(location); }
  closeDetail(): void { this.selectedLocation.set(null); }
}
