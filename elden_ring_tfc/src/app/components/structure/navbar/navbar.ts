import {Component, inject, OnInit} from '@angular/core';
import {Router, RouterLink} from '@angular/router';
import {AuthService} from '../../../services/authService';
import {User} from '../../../common/interface';

@Component({
  selector: 'app-navbar',
  imports: [
    RouterLink
  ],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar implements OnInit {

  private readonly authService: AuthService = inject(AuthService);
  user: User | null = null;
  private readonly router = inject(Router);

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
