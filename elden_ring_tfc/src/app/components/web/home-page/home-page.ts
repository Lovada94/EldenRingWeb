import {Component, inject, OnInit} from '@angular/core';
import {RouterLink} from '@angular/router';
import {AuthModal} from '../auth/auth-modal/auth-modal';
import {AuthService} from '../../../services/authService';
import {User} from '../../../common/interface';

@Component({
  selector: 'app-home',
  imports: [
    RouterLink,
    AuthModal
  ],
  templateUrl: './home-page.html',
  styleUrl: './home-page.css',
})
export class HomePage implements OnInit {

  private readonly authService: AuthService = inject(AuthService);
  user: User | null = null;

  showAuthModal = false;

  /* Nombre de la tarjeta bloqueada que muestra el toast; null cuando está oculto */
  lockedCard: string | null = null;
  private toastTimer: any;

  handleAuthClick(_isLogin: boolean) {
    if (this.authService.isLogged()) return;
    this.showAuthModal = true;
  }

  /* Mostrar el toast bajo la tarjeta bloqueada y ocultarlo tras 2,5 s */
  onLockedClick(card: string): void {
    clearTimeout(this.toastTimer);
    this.lockedCard = card;
    this.toastTimer = setTimeout(() => { this.lockedCard = null; }, 2500);
  }

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

}
