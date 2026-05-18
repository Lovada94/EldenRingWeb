import {Component, inject, Input, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../services/authService';
import {User} from '../../../common/interface';
import {AuthModal} from '../../web/auth/auth-modal/auth-modal';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink,
    AuthModal
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  private readonly authService: AuthService = inject(AuthService);
  user: User | null = null;
  private readonly router = inject(Router);
  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  showAuthModal = false;
  authMode: 'login' | 'register' = 'login';

  isMenuOpen = false;

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  handleAuthClick(isLogin: boolean) {
    if (this.authService.isLogged()) return;

    this.authMode = isLogin ? 'login' : 'register';
    this.showAuthModal = true;
  }

  constructor() {
    this.router.events.subscribe(() => {
      this.isMenuOpen = false;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  getAvatarUrl(avatar: string): string {
    return `${this.backendUrl}/uploads/avatars/${avatar}`;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.classList.add('menu-open');
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.classList.remove('menu-open');
  }

}
