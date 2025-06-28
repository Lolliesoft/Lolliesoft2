// src/app/services/blog.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogPost } from '../blog/blog-post.model';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly apiUrl = '/api/blog';

  constructor(
    private http: HttpClient,
    private auth: AuthService
  ) { }

  /** Build either a Bearer header or cookie option */
  private authOptions() {
    const token = this.auth.getToken();
    if (token) {
      return {
        headers: new HttpHeaders().set('Authorization', `Bearer ${token}`)
      };
    }
    return { withCredentials: true };
  }

  /** Get all public posts */
  getAll(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(
      this.apiUrl,
      this.authOptions()
    );
  }

  /** Get a single post by id */
  getById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(
      `${this.apiUrl}/${id}`,
      this.authOptions()
    );
  }

  /** Create a new post */
  create(form: FormData): Observable<BlogPost> {
    return this.http.post<BlogPost>(
      this.apiUrl,
      form,
      this.authOptions()
    );
  }

  /** Update an existing post */
  update(id: number, form: FormData): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      form,
      this.authOptions()
    );
  }

  /** Delete a post */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      this.authOptions()
    );
  }
}
