import {Component, inject} from '@angular/core';
import { RouterLink } from "@angular/router";
import {AuthModal} from '../auth/auth-modal/auth-modal';
import {AuthService} from '../../../services/authService';
import {User} from '../../../common/interface';

@Component({
  selector: 'app-start',
  imports: [RouterLink, AuthModal],
  templateUrl: './start.html',
  styleUrl: './start.css',
})
export class Start {

  private readonly authService: AuthService = inject(AuthService);
  user: User | null = null;

  showAuthModal = false;

  handleAuthClick(isLogin: boolean) {
    if (this.authService.isLogged()) return;
    this.showAuthModal = true;
  }

  ngOnInit(){
    this.authService.user$.subscribe(user => {
      this.user = user;
    });
  }

}
