import { inject, Injectable, Injector } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { LoginCredentials, LoginResponse, RegisterCredentials, RegisterResponse, User } from '../common/interface';
import { FavoritesService } from './favoritesService';

/* Servicio de autenticación: gestiona el estado de sesión del usuario,
   el token JWT y la sincronización con localStorage */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http: HttpClient    = inject(HttpClient);
  private readonly injector: Injector  = inject(Injector);
  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  /* BehaviorSubject que emite el usuario actual a todos los componentes suscritos */
  private userSubject = new BehaviorSubject<User | null>(this.getUser());
  user$ = this.userSubject.asObservable();

  constructor() {
    /* Al arrancar la app, comprobar si el token guardado ha expirado */
    if (this.isLogged()) {
      if (this.isTokenExpired()) {
        this.logout();
      } else {
        /* Recargar favoritos del usuario si la sesión sigue activa */
        setTimeout(() => {
          this.getFavoritesService().loadFavorites().subscribe();
        }, 100);
      }
    }
  }

  /* Decodificar el token JWT y comprobar si la fecha de expiración ha pasado */
  private isTokenExpired(): boolean {
    const token = this.getToken();
    if (!token) return true;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 < Date.now();
  }

  /* Inyección diferida para evitar dependencia circular con FavoritesService */
  private getFavoritesService() {
    return this.injector.get(FavoritesService);
  }

  /* Enviar credenciales al backend, guardar el token y actualizar el estado */
  login(credentials: LoginCredentials) {
    return this.http.post<LoginResponse>(`${this.backendUrl}/login`, credentials).pipe(
      tap((res) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.userSubject.next(res.user);
        this.getFavoritesService().loadFavorites().subscribe();
      }),
    );
  }

  /* Obtener el token JWT almacenado en localStorage */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /* Registrar un usuario nuevo en el backend */
  register(data: RegisterCredentials): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.backendUrl}/register`, data);
  }

  /* Recuperar los datos del usuario desde localStorage */
  getUser(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  /* Comprobar si hay una sesión activa (existe token en localStorage) */
  isLogged(): boolean {
    return localStorage.getItem('token') !== null;
  }

  /* Cerrar sesión: eliminar token y usuario del localStorage y notificar al BehaviorSubject */
  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.userSubject.next(null);
  }

  /* Obtener el perfil completo del usuario desde el backend */
  getProfile() {
    return this.http.get(`${this.backendUrl}/profile`);
  }

  /* Actualizar los datos del usuario en localStorage y notificar a los suscriptores */
  updateLocalUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user);
  }
}
