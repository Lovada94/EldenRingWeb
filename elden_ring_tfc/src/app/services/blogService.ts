import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

/* Interfaces del blog */
export interface BlogPost {
  id_post:       number;
  id_user:       number;
  id_team:       number | null;
  title:         string;
  content:       string;
  created_at:    string;
  updated_at:    string;
  username:      string;
  avatar:        string;
  comment_count: number;
}

export interface BlogComment {
  id_comment: number;
  id_post:    number;
  id_user:    number;
  content:    string;
  created_at: string;
  username:   string;
  avatar:     string;
}

/* Detalle completo de un post: incluye equipo adjunto y lista de comentarios */
export interface BlogPostDetail extends BlogPost {
  team:     Record<string, string | null> | null;
  comments: BlogComment[];
}

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly http       = inject(HttpClient);
  private readonly backendUrl = 'http://localhost/tfc-elden-ring/elden_ring_backend/public';

  /* URL base para acceder a los avatares subidos */
  readonly avatarBase = `${this.backendUrl}/uploads/avatars/`;

  /* Signal con la lista de posts y el detalle del post abierto */
  posts  = signal<BlogPost[]>([]);
  detail = signal<BlogPostDetail | null>(null);

  /* Cargar todos los posts y actualizar el signal de lista */
  loadPosts(): Observable<any> {
    return this.http.get<{ posts: BlogPost[] }>(`${this.backendUrl}/posts`).pipe(
      tap(res => this.posts.set(res.posts ?? []))
    );
  }

  /* Cargar el detalle de un post concreto y actualizar el signal de detalle */
  loadPost(id: number): Observable<any> {
    return this.http.get<{ post: BlogPostDetail }>(`${this.backendUrl}/posts/${id}`).pipe(
      tap(res => this.detail.set(res.post ?? null))
    );
  }

  /* Crear un nuevo post, con equipo adjunto opcional */
  createPost(title: string, content: string, idTeam: number | null): Observable<any> {
    return this.http.post(`${this.backendUrl}/posts`, { title, content, id_team: idTeam });
  }

  /* Eliminar un post y quitarlo del signal de lista */
  deletePost(id: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/posts/${id}`).pipe(
      tap(() => this.posts.update(ps => ps.filter(p => p.id_post !== id)))
    );
  }

  /* Añadir un comentario y actualizar el detalle del post en memoria */
  addComment(postId: number, content: string): Observable<any> {
    return this.http.post<{ comment: BlogComment }>(
      `${this.backendUrl}/posts/${postId}/comments`, { content }
    ).pipe(
      tap(res => {
        if (res.comment) {
          this.detail.update(d => d ? {
            ...d,
            comments: [...d.comments, res.comment],
          } : d);
        }
      })
    );
  }

  /* Eliminar un comentario y actualizar el detalle del post en memoria */
  deleteComment(commentId: number): Observable<any> {
    return this.http.delete(`${this.backendUrl}/comments/${commentId}`).pipe(
      tap(() => {
        this.detail.update(d => d ? {
          ...d,
          comments: d.comments.filter(c => c.id_comment !== commentId),
        } : d);
      })
    );
  }

  /* Construir la URL completa del avatar dado su nombre de fichero */
  avatarUrl(filename: string | null): string {
    return `${this.avatarBase}${filename || 'default.png'}`;
  }
}
