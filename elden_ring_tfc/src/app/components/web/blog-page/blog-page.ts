import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin, Observable, catchError, of } from 'rxjs';
import { BlogService } from '../../../services/blogService';
import { EldenRingApiService } from '../../../services/eldenRingService';
import { AuthService } from '../../../services/authService';
import { TeamService } from '../../../services/teamService';

const SLOT_DEFS: { slot: string; category: string }[] = [
  { slot: 'weapon_r1', category: 'weapons' }, { slot: 'weapon_r2', category: 'weapons' },
  { slot: 'weapon_r3', category: 'weapons' }, { slot: 'weapon_l1', category: 'weapons' },
  { slot: 'weapon_l2', category: 'weapons' }, { slot: 'weapon_l3', category: 'weapons' },
  { slot: 'arrow1',   category: 'ammos' },   { slot: 'arrow2',    category: 'ammos' },
  { slot: 'bolt1',    category: 'ammos' },   { slot: 'bolt2',     category: 'ammos' },
  { slot: 'ash1',     category: 'ashes' },   { slot: 'ash2',      category: 'ashes' },
  { slot: 'ash3',     category: 'ashes' },
  { slot: 'armor_head',  category: 'armors' }, { slot: 'armor_chest', category: 'armors' },
  { slot: 'armor_hands', category: 'armors' }, { slot: 'armor_legs',  category: 'armors' },
  { slot: 'talisman1', category: 'talismans' }, { slot: 'talisman2', category: 'talismans' },
  { slot: 'talisman3', category: 'talismans' }, { slot: 'talisman4', category: 'talismans' },
  { slot: 'item1',  category: 'items' }, { slot: 'item2',  category: 'items' },
  { slot: 'item3',  category: 'items' }, { slot: 'item4',  category: 'items' },
  { slot: 'item5',  category: 'items' }, { slot: 'item6',  category: 'items' },
  { slot: 'item7',  category: 'items' }, { slot: 'item8',  category: 'items' },
  { slot: 'item9',  category: 'items' }, { slot: 'item10', category: 'items' },
  { slot: 'spell1', category: 'sorceries' }, { slot: 'spell2', category: 'sorceries' },
  { slot: 'spell3', category: 'sorceries' }, { slot: 'spell4', category: 'sorceries' },
  { slot: 'spell5', category: 'sorceries' },
];

@Component({
  selector: 'app-blog-page',
  imports: [FormsModule, DatePipe],
  templateUrl: './blog-page.html',
  styleUrl: './blog-page.css',
})
export class BlogPage implements OnInit {
  protected readonly blogService  = inject(BlogService);
  protected readonly teamService  = inject(TeamService);
  private readonly apiService     = inject(EldenRingApiService);
  private readonly authService    = inject(AuthService);
  private readonly route          = inject(ActivatedRoute);

  currentUser   = toSignal(this.authService.user$, { initialValue: this.authService.getUser() });

  view          = signal<'list' | 'detail'>('list');
  loaded        = signal(false);
  detailLoaded  = signal(false);
  teamLoaded    = signal(false);
  submitting    = signal(false);

  showCreateForm  = signal(false);
  showTeamModal   = signal(false);
  newTitle        = '';
  newContent      = '';
  newComment      = '';
  searchTerm      = '';
  pendingTeamId:   number | null = null;
  pendingTeamName: string | null = null;

  teamItemsData = signal<Record<string, any>>({});

  filteredPosts = computed(() => {
    const term = this.searchTerm.toLowerCase().trim();
    if (!term) return this.blogService.posts();
    return this.blogService.posts().filter(p => p.title.toLowerCase().includes(term));
  });

  ngOnInit(): void {
    const teamParam = this.route.snapshot.queryParamMap.get('team');
    this.teamService.loadAllTeams().subscribe(() => {
      if (teamParam) {
        this.pendingTeamId = +teamParam;
        const found = this.teamService.teams().find(t => Number(t.id_team) === +teamParam);
        this.pendingTeamName = found?.name ?? null;
        this.showCreateForm.set(true);
      }
    });
    this.blogService.loadPosts().subscribe({
      next:  () => this.loaded.set(true),
      error: () => this.loaded.set(true),
    });
  }

  openPost(id: number): void {
    this.view.set('detail');
    this.detailLoaded.set(false);
    this.teamLoaded.set(false);
    this.teamItemsData.set({});
    this.newComment = '';
    this.blogService.loadPost(id).subscribe({
      next: () => {
        this.detailLoaded.set(true);
        const detail = this.blogService.detail();
        if (detail?.team) {
          this.loadTeamItems(detail.team as Record<string, any>);
        } else {
          this.teamLoaded.set(true);
        }
      },
      error: () => { this.detailLoaded.set(true); this.teamLoaded.set(true); },
    });
  }

  goBack(): void {
    this.view.set('list');
    this.blogService.detail.set(null);
  }

  toggleCreateForm(): void {
    this.showCreateForm.update(v => !v);
    this.newTitle        = '';
    this.newContent      = '';
    this.pendingTeamId   = null;
    this.pendingTeamName = null;
  }

  selectTeam(id: number, name: string): void {
    this.pendingTeamId   = id;
    this.pendingTeamName = name;
    this.showTeamModal.set(false);
  }

  clearPendingTeam(): void {
    this.pendingTeamId   = null;
    this.pendingTeamName = null;
  }

  submitPost(): void {
    if (!this.newTitle.trim() || this.submitting()) return;
    this.submitting.set(true);
    this.blogService.createPost(this.newTitle.trim(), this.newContent.trim(), this.pendingTeamId).subscribe({
      next: () => {
        this.submitting.set(false);
        this.showCreateForm.set(false);
        this.newTitle        = '';
        this.newContent      = '';
        this.pendingTeamId   = null;
        this.pendingTeamName = null;
        this.blogService.loadPosts().subscribe();
      },
      error: () => this.submitting.set(false),
    });
  }

  deletePost(id: number): void {
    this.blogService.deletePost(id).subscribe();
  }

  deletePostFromDetail(): void {
    const detail = this.blogService.detail();
    if (!detail) return;
    this.blogService.deletePost(detail.id_post).subscribe({ next: () => this.goBack() });
  }

  submitComment(): void {
    if (!this.newComment.trim() || this.submitting()) return;
    const detail = this.blogService.detail();
    if (!detail) return;
    this.submitting.set(true);
    this.blogService.addComment(detail.id_post, this.newComment.trim()).subscribe({
      next:  () => { this.newComment = ''; this.submitting.set(false); },
      error: () => this.submitting.set(false),
    });
  }

  deleteComment(id: number): void {
    this.blogService.deleteComment(id).subscribe();
  }

  getSlotItem(slot: string): any | null {
    const team = this.blogService.detail()?.team as any;
    if (!team) return null;
    const apiId = team[slot];
    if (!apiId) return null;
    return this.teamItemsData()[apiId] ?? null;
  }

  avatarUrl(avatar: string | null): string {
    return this.blogService.avatarUrl(avatar);
  }

  private loadTeamItems(team: Record<string, any>): void {
    const requests: Record<string, Observable<any>> = {};
    for (const def of SLOT_DEFS) {
      const apiId = team[def.slot];
      if (apiId && !requests[apiId]) {
        requests[apiId] = this.getItemByCategory(def.category, apiId).pipe(catchError(() => of(null)));
      }
    }
    if (!Object.keys(requests).length) { this.teamLoaded.set(true); return; }
    forkJoin(requests).subscribe({
      next:  results => { this.teamItemsData.set(results as Record<string, any>); this.teamLoaded.set(true); },
      error: ()      => this.teamLoaded.set(true),
    });
  }

  private getItemByCategory(category: string, id: string): Observable<any> {
    switch (category) {
      case 'weapons':   return this.apiService.getOneWeapon(id);
      case 'ammos':     return this.apiService.getOneAmmo(id);
      case 'armors':    return this.apiService.getOneArmor(id);
      case 'ashes':     return this.apiService.getOneAsh(id);
      case 'talismans': return this.apiService.getOneTalisman(id);
      case 'items':     return this.apiService.getOneItem(id);
      case 'sorceries': return this.apiService.getOneSorcery(id);
      default:          return this.apiService.getOneItem(id);
    }
  }
}
