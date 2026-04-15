import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {AuthService} from '../../../../services/authService';
import {LoginCredentials, RegisterCredentials} from '../../../../common/interface';
import {Router} from '@angular/router';
import {FormBuilder, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {FormValidators} from '../../../../validators/formValidators';

@Component({
  selector: 'app-auth-modal',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './auth-modal.html',
  styleUrl: './auth-modal.css',
})
export class AuthModal {

  private readonly authService: AuthService = inject(AuthService);

  private mouseDownInside = false;
  private readonly router = inject(Router);

  private readonly formBuilder: FormBuilder = inject(FormBuilder);
  errorMessage = '';

  loginForm: FormGroup = this.formBuilder.group({
    identifier: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  });

  registerForm: FormGroup = this.formBuilder.group({
    username: ['', [Validators.required, Validators.minLength(3), FormValidators.notOnlyWhiteSpace]],
    name: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
    surnames: ['', [Validators.required, FormValidators.notOnlyWhiteSpace]],
    birthDate: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirmPassword: ['', [Validators.required]]
  }, {
    validators: FormValidators.passwordMatch
  });

  showPassword = false;
  showConfirmPassword = false;

  get identifierCtrl(): any {
    return this.loginForm.get('identifier');
  }

  get passwordCtrl(): any {
    return this.loginForm.get('password');
  }

  get usernameCtrl(): any {
    return this.registerForm.get('username');
  }

  get nameCtrl(): any {
    return this.registerForm.get('name');
  }

  get surnamesCtrl(): any {
    return this.registerForm.get('surnames');
  }

  get birthDateCtrl(): any {
    return this.registerForm.get('birthDate');
  }

  get emailCtrl(): any {
    return this.registerForm.get('email');
  }

  get registerPasswordCtrl(): any {
    return this.registerForm.get('password');
  }

  get confirmPasswordCtrl(): any {
    return this.registerForm.get('confirmPassword');
  }

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
    this.loginForm.reset();
    this.registerForm.reset();
  }

  submitLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const value = this.loginForm.value;

    const credentials: LoginCredentials = {
      password: value.password,
      ...(value.identifier.includes('@')
        ? {email: value.identifier}
        : {username: value.identifier})
    };

    this.authService.login(credentials).subscribe({
      next: () => {
        this.close();
        this.router.navigate(['/home']);
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Error';
      }
    });
  }

  submitRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const value = this.registerForm.value;

    const data: RegisterCredentials = {
      name: value.name,
      surnames: value.surnames,
      birth_date: new Date(value.birthDate).toISOString().split('T')[0],
      email: value.email,
      username: value.username,
      password: value.password
    };

    this.authService.register(data).subscribe({
      next: () => {
        this.toggleMode();
      },
      error: (err) => {
        if (err.error?.errors) {
          this.errorMessage = Object.values(err.error.errors).join(', ');
        } else {
          this.errorMessage = err.error?.message || 'Error inesperado';
        }
      }
    });
  }

  close() {
    this.closeModal.emit();
  }
}
