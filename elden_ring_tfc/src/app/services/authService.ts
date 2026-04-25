import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, tap} from 'rxjs';
import {LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, User} from '../common/interface';
import {FavoritesService} from './favorite-service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  private userSubject = new BehaviorSubject<User | null>(this.getUser());
  user$ = this.userSubject.asObservable();

  private readonly favoritesService: FavoritesService = inject(FavoritesService);

  constructor() {
    if (this.isLogged()) {
      this.favoritesService.loadFavorites().subscribe();
    }
  }

  login(credentials: LoginCredentials) {
    return this.http.post<LoginResponse>(`${this.backendUrl}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
        this.favoritesService.loadFavorites().subscribe();
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  register(data: RegisterCredentials): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(this.backendUrl + '/register', data);
  }

  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  isLogged(): boolean {
    return localStorage.getItem('token') !== null;
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }

  getProfile() {
    return this.http.get(`${this.backendUrl}/profile`);
  }
}
