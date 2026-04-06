import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { Armor } from '../../../../common/interface';

@Component({
  selector: 'app-armors',
  imports: [NgbPagination],
  templateUrl: './armors.html',
  styleUrl: './armors.css',
})
export class ArmorsPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);

  armors         = signal<Armor[]>([]);
  totalItems     = signal<number>(0);
  currentPage    = signal<number>(1);
  loaded         = signal<boolean>(false);
  searchTerm     = signal<string>('');
  selectedArmor  = signal<Armor | null>(null);

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  readonly statIcons: Record<string, { label: string; emoji: string }> = {
    'Phy':      { label: 'Físi',   emoji: '⚔️' },
    'Mag':      { label: 'Mag',    emoji: '✨' },
    'Fire':     { label: 'Fue',    emoji: '🔥' },
    'Ligt':     { label: 'Rayo',   emoji: '⚡' },
    'Holy':     { label: 'Sagr',   emoji: '☀️' },
    'Bld':      { label: 'Hemorr', emoji: '🩸' },
    'Fros':     { label: 'Escarc', emoji: '❄️' },
    'Poi':      { label: 'Veneno', emoji: '☠️' },
    'Sca':      { label: 'Rot',    emoji: '🟢' },
    'Sleep':    { label: 'Sueño',  emoji: '💤' },
    'Madness':  { label: 'Locura', emoji: '🌀' },
    'Death':    { label: 'Muerte', emoji: '💀' },
  };

  getStat(name: string): { label: string; emoji: string } {
    return this.statIcons[name] ?? { label: name, emoji: '•' };
  }

  ngOnInit(): void {
    this.loadArmors();
  }

  private loadArmors(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getArmors(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.armors.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar armaduras:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadArmors();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadArmors();
  }

  openDetail(armor: Armor): void { this.selectedArmor.set(armor); }
  closeDetail(): void { this.selectedArmor.set(null); }
}
