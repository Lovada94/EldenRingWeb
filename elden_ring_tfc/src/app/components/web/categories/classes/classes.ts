import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { NgbPagination } from '@ng-bootstrap/ng-bootstrap';
import { EldenRingApiService } from '../../../../services/eldenRingService';
import { EldenClass } from '../../../../common/interface';

@Component({
  selector: 'app-classes',
  imports: [NgbPagination],
  templateUrl: './classes.html',
  styleUrl: './classes.css',
})
export class ClassesPage implements OnInit {

  private readonly apiService = inject(EldenRingApiService);

  classes         = signal<EldenClass[]>([]);
  totalItems      = signal<number>(0);
  currentPage     = signal<number>(1);
  loaded          = signal<boolean>(false);
  searchTerm      = signal<string>('');
  selectedClass   = signal<EldenClass | null>(null);

  readonly limit = 20;
  private apiPage = computed(() => this.currentPage() - 1);

  readonly statIcons: Record<string, { label: string; emoji: string }> = {
    'level':        { label: 'Nivel',  emoji: '⭐' },
    'vigor':        { label: 'Vigor',  emoji: '💗' },
    'mind':         { label: 'Mente',  emoji: '🧠' },
    'endurance':    { label: 'Resist', emoji: '🛡️' },
    'strength':     { label: 'Fuer',   emoji: '💪' },
    'dexterity':    { label: 'Dest',   emoji: '🤸' },
    'intelligence': { label: 'Int',    emoji: '📖' },
    'faith':        { label: 'Fe',     emoji: '🙏' },
    'arcane':       { label: 'Arc',    emoji: '🌀' },
  };

  getStat(key: string): { label: string; emoji: string } {
    return this.statIcons[key] ?? { label: key, emoji: '•' };
  }

  ngOnInit(): void {
    this.loadClasses();
  }

  private loadClasses(): void {
    this.loaded.set(false);
    const name = this.searchTerm().trim() || undefined;
    this.apiService.getClasses(this.apiPage(), this.limit, name).subscribe({
      next: (data) => {
        this.classes.set(data.data);
        this.totalItems.set(data.total);
        this.loaded.set(true);
      },
      error: (err) => {
        console.error('Error al cargar clases:', err);
        this.loaded.set(true);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
    this.loadClasses();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
    this.currentPage.set(1);
    this.loadClasses();
  }

  openDetail(cls: EldenClass): void { this.selectedClass.set(cls); }
  closeDetail(): void { this.selectedClass.set(null); }
}
