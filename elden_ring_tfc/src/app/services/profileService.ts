import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AuthService } from './authService';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly authService: AuthService = inject(AuthService);
  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  getProfile(): Observable<any> {
    return this.http.get(`${this.backendUrl}/profile`);
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${this.backendUrl}/profile`, data).pipe(
      tap((res: any) => {
        const currentUser = this.authService.getUser()!;
        const updatedUser = { ...currentUser, ...res.user };
        this.authService.updateLocalUser(updatedUser);
      })
    );
  }

  updatePassword(data: { current_password: string; new_password: string }): Observable<any> {
    return this.http.put(`${this.backendUrl}/profile/password`, data);
  }

  updateAvatar(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('avatar', file);
    return this.http.post(`${this.backendUrl}/profile/avatar`, formData).pipe(
      tap((res: any) => {
        const currentUser = this.authService.getUser()!;
        const updatedUser = { ...currentUser, avatar: res.avatar };
        this.authService.updateLocalUser(updatedUser);
      })
    );
  }

  deleteAccount(): Observable<any> {
    return this.http.delete(`${this.backendUrl}/profile`);
  }
}
