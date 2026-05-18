import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/authService';
import { ProfileService } from '../../../services/profileService';
import { FormValidators } from '../../../validators/formValidators';
import { User } from '../../../common/interface';

/* Validator de grupo: comprueba que nueva contraseña y confirmación coincidan */
function passwordMatchProfile(form: FormGroup) {
  const np = form.get('new_password')?.value;
  const cp = form.get('confirm_password')?.value;
  if (!np || !cp) return null;
  return np === cp ? null : { passwordMismatch: true };
}

/* Página de perfil: edición de datos personales, contraseña, avatar y eliminación de cuenta */
@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {

  private readonly authService:    AuthService    = inject(AuthService);
  private readonly profileService: ProfileService = inject(ProfileService);
  private readonly router:         Router         = inject(Router);
  private readonly fb:             FormBuilder    = inject(FormBuilder);

  /* Datos del usuario cargados desde el backend */
  user              = signal<User | null>(null);

  /* Mensajes de éxito y error para el formulario de perfil */
  successMsg        = signal<string>('');
  errorMsg          = signal<string>('');

  /* Mensajes de éxito y error para el formulario de contraseña */
  pwSuccessMsg      = signal<string>('');
  pwErrorMsg        = signal<string>('');

  /* Controla la visibilidad del diálogo de confirmación antes de eliminar la cuenta */
  showDeleteConfirm = signal<boolean>(false);

  /* Flags para alternar la visibilidad de los campos de contraseña */
  showPassword        = false;
  showNewPassword     = false;
  showConfirmPassword = false;

  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  /* Formulario de edición de datos básicos del perfil */
  profileForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3), FormValidators.notOnlyWhiteSpace]],
    email:    ['', [Validators.required, Validators.email]],
  });

  /* Formulario de cambio de contraseña con validación de coincidencia */
  passwordForm: FormGroup = this.fb.group({
    current_password: ['', [Validators.required]],
    new_password:     ['', [Validators.required, Validators.minLength(6), Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirm_password: ['', [Validators.required]],
  }, { validators: passwordMatchProfile });

  /* Getters profileForm */
  get usernameCtrl(): any { return this.profileForm.get('username'); }
  get emailCtrl(): any    { return this.profileForm.get('email'); }

  /* Getters passwordForm */
  get currentPasswordCtrl(): any  { return this.passwordForm.get('current_password'); }
  get newPasswordCtrl(): any      { return this.passwordForm.get('new_password'); }
  get confirmPasswordCtrl(): any  { return this.passwordForm.get('confirm_password'); }

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (res: any) => {
        this.user.set(res.user);
        this.profileForm.patchValue({
          username: res.user.username,
          email:    res.user.email,
        });
      }
    });
  }

  /* Construir la URL completa del avatar a partir del nombre de fichero */
  getAvatarUrl(avatar: string): string {
    return `${this.backendUrl}/uploads/avatars/${avatar}`;
  }

  /* Procesar la selección de un nuevo archivo de avatar y enviarlo al backend */
  onAvatarChange(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    this.profileService.updateAvatar(file).subscribe({
      next: (res: any) => {
        this.user.update(u => u ? { ...u, avatar: res.avatar } : u);
        this.successMsg.set('Avatar actualizado correctamente');
      },
      error: (err) => this.errorMsg.set(err.error?.message || 'Error al actualizar el avatar')
    });
  }

  /* Enviar el formulario de perfil para actualizar username y email */
  submitProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.successMsg.set('');
    this.errorMsg.set('');
    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: () => this.successMsg.set('Perfil actualizado correctamente'),
      error: (err) => this.errorMsg.set(err.error?.message || 'Error al actualizar el perfil')
    });
  }

  /* Enviar el formulario de contraseña para actualizarla en el backend */
  submitPassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.pwSuccessMsg.set('');
    this.pwErrorMsg.set('');
    const { current_password, new_password } = this.passwordForm.value;
    this.profileService.updatePassword({ current_password, new_password }).subscribe({
      next: () => {
        this.pwSuccessMsg.set('Contraseña actualizada correctamente');
        this.passwordForm.reset();
      },
      error: (err) => this.pwErrorMsg.set(err.error?.message || 'Error al actualizar la contraseña')
    });
  }

  /* Eliminar la cuenta del usuario, cerrar sesión y redirigir al inicio */
  deleteAccount(): void {
    this.profileService.deleteAccount().subscribe({
      next: () => {
        this.authService.logout();
        this.router.navigate(['/start']);
      },
      error: (err) => this.errorMsg.set(err.error?.message || 'Error al eliminar la cuenta')
    });
  }
}
