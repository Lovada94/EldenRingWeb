import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Favorite } from '../common/interface';

@Injectable({
  providedIn: 'root'
})
export class FavoritesService {

  private readonly http: HttpClient = inject(HttpClient);
  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  /* Signal reactivo con la lista de favoritos del usuario en memoria */
  favorites = signal<Favorite[]>([]);

  /* Cargar los favoritos del usuario desde el backend y actualizar el signal */
  loadFavorites(): Observable<{ status: number; favorites: Favorite[] }> {
    return this.http.get<{ status: number; favorites: Favorite[] }>(
      `${this.backendUrl}/favorites`
    ).pipe(
      tap(res => this.favorites.set(res.favorites))
    );
  }

  /* Comprobar si un elemento ya está en la lista de favoritos del usuario */
  isFavorite(apiId: string, category: string): boolean {
    return this.favorites().some(
      f => f.api_id === apiId && f.category === category
    );
  }

  /* Añadir un elemento a favoritos en el backend y actualizar el signal localmente */
  addFavorite(item: Favorite): Observable<any> {
    return this.http.post(`${this.backendUrl}/favorites`, item).pipe(
      tap(() => this.favorites.update(favs => [...favs, item]))
    );
  }

  /* Eliminar un favorito del backend y actualizar el signal localmente */
  removeFavorite(apiId: string, category: string): Observable<any> {
    return this.http.delete(`${this.backendUrl}/favorites`, {
      body: { api_id: apiId, category }
    }).pipe(
      tap(() => this.favorites.update(favs =>
        favs.filter(f => !(f.api_id === apiId && f.category === category))
      ))
    );
  }

  /* Alternar el estado de favorito: añadir si no existe, eliminar si ya existe */
  toggleFavorite(item: Favorite): Observable<any> {
    if (this.isFavorite(item.api_id, item.category)) {
      return this.removeFavorite(item.api_id, item.category);
    } else {
      return this.addFavorite(item);
    }
  }
}
