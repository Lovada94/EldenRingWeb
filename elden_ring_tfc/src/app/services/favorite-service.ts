import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface Favorite {
  id_favorite?: number;
  id_user?: number;
  api_id: string;
  category: string;
  name: string;
  image: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  // Signal con la lista de favoritos del usuario
  favorites = signal<Favorite[]>([]);

  // Cargar favoritos del usuario (llamar al iniciar sesión)
  loadFavorites(): Observable<{ status: number; favorites: Favorite[] }> {
    return this.http.get<{ status: number; favorites: Favorite[] }>(
      `${this.backendUrl}/favorites`
    ).pipe(
      tap(res => this.favorites.set(res.favorites))
    );
  }

  // Comprobar si un item es favorito
  isFavorite(apiId: string, category: string): boolean {
    return this.favorites().some(
      f => f.api_id === apiId && f.category === category
    );
  }

  // Añadir favorito
  addFavorite(item: Favorite): Observable<any> {
    return this.http.post(`${this.backendUrl}/favorites`, item).pipe(
      tap(() => this.favorites.update(favs => [...favs, item]))
    );
  }

  // Eliminar favorito
  removeFavorite(apiId: string, category: string): Observable<any> {
    return this.http.delete(`${this.backendUrl}/favorites`, {
      body: { api_id: apiId, category }
    }).pipe(
      tap(() => this.favorites.update(favs =>
        favs.filter(f => !(f.api_id === apiId && f.category === category))
      ))
    );
  }

  // Toggle — añadir o quitar según el estado actual
  toggleFavorite(item: Favorite): Observable<any> {
    if (this.isFavorite(item.api_id, item.category)) {
      return this.removeFavorite(item.api_id, item.category);
    } else {
      return this.addFavorite(item);
    }
  }
}
