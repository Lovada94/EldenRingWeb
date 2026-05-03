import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/authService';
import { ProfileService } from '../../../services/profileService';
import { User } from '../../../common/interface';

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

  user              = signal<User | null>(null);
  successMsg        = signal<string>('');
  errorMsg          = signal<string>('');
  pwSuccessMsg      = signal<string>('');
  pwErrorMsg        = signal<string>('');
  showDeleteConfirm = signal<boolean>(false);

  showPassword        = false;
  showNewPassword     = false;
  showConfirmPassword = false;

  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  profileForm: FormGroup = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email:    ['', [Validators.required, Validators.email]],
  });

  passwordForm: FormGroup = this.fb.group({
    current_password: ['', [Validators.required]],
    new_password:     ['', [Validators.required, Validators.minLength(6),
      Validators.pattern(/^(?=.*[A-Z])(?=.*\d).+$/)]],
    confirm_password: ['', [Validators.required]],
  }, { validators: this.passwordMatchValidator });

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

  private passwordMatchValidator(form: FormGroup) {
    const np = form.get('new_password')?.value;
    const cp = form.get('confirm_password')?.value;
    return np === cp ? null : { passwordMismatch: true };
  }

  getAvatarUrl(avatar: string): string {
    return `${this.backendUrl}/uploads/avatars/${avatar}`;
  }

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
