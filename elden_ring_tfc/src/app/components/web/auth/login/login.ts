import {Component, inject} from '@angular/core';
import {AuthService} from '../../../../services/authService';
import {FormsModule} from '@angular/forms';
import {LoginCredentials} from '../../../../common/interface';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  private readonly authService : AuthService = inject(AuthService);
  credentials: LoginCredentials = {
    email: '',
    password: ''
  };

  private readonly router = inject(Router);

  onSubmit() {

    this.authService.login(this.credentials).subscribe({
      next: () => {
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
}
