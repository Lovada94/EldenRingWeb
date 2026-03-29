import {Component, EventEmitter, inject, Input, OnInit, Output, SimpleChanges} from '@angular/core';
import {AuthService} from '../../../../services/authService';
import {FormsModule} from '@angular/forms';
import {LoginCredentials, RegisterCredentials} from '../../../../common/interface';
import {Router} from '@angular/router';

@Component({
  selector: 'app-auth-modal',
  imports: [
    FormsModule
  ],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
})
export class AuthModal {

  identifier = '';
  name = '';
  surnames = '';
  birthDate = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';

  private readonly authService : AuthService = inject(AuthService);

  private mouseDownInside = false;
  private readonly router = inject(Router);

  @Output() closeModal = new EventEmitter<void>();

  @Input() mode: 'login' | 'register' = 'login';
  isLogin = true;

  ngOnChanges() {
    this.isLogin = this.mode === 'login';
  }

  onMouseDown(event: MouseEvent) {
    this.mouseDownInside = (event.target !== event.currentTarget);
  }

  onMouseUp(event: MouseEvent) {
    const mouseUpInside = (event.target !== event.currentTarget);

    if (!this.mouseDownInside && !mouseUpInside) {
      this.close();
    }
  }

  toggleMode() {
    this.isLogin = !this.isLogin;
    this.errorMessage = '';
    this.identifier = '';
    this.password = '';
    this.confirmPassword = '';
  }

  submit() {
    this.errorMessage = '';

    if (this.isLogin) {
      const credentials: LoginCredentials = {
        password: this.password
      };

      if (this.identifier.includes('@')) {
        credentials.email = this.identifier;
      } else {
        credentials.username = this.identifier;
      }

      this.authService.login(credentials).subscribe({
        next: () => {
          this.identifier = '';
          this.password = '';
          this.close();
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error inesperado';
        }
      });

    } else {
      if (this.password !== this.confirmPassword) {
        this.errorMessage = 'Las contraseñas no coinciden';
        return;
      }

      const registerData: RegisterCredentials = {
        name: this.name,
        surnames: this.surnames,
        birth_date: this.birthDate,
        email: this.email,
        username: this.identifier,
        password: this.password
      };

      this.authService.register(registerData).subscribe({
        next: () => {
          this.errorMessage = 'Cuenta creada, inicia sesión';
          this.toggleMode();
        },
        error: (err) => {
          this.errorMessage = err.error?.message || 'Error inesperado';
        }
      });
    }
  }

  close() {
    this.closeModal.emit();
  }
}
