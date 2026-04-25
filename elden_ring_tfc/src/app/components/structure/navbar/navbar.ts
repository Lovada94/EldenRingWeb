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

  showAuthModal = false;
  authMode: 'login' | 'register' = 'login';

  handleAuthClick(isLogin: boolean) {
    if (this.authService.isLogged()) return;

    this.authMode = isLogin ? 'login' : 'register';
    this.showAuthModal = true;
  }

  isMenuOpen = false;

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    document.body.classList.add('menu-open');
  }

  closeMenu() {
    this.isMenuOpen = false;
    document.body.classList.remove('menu-open');
  }

  constructor() {
    this.router.events.subscribe(() => {
      this.isMenuOpen = false;
    });
  }

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

}
