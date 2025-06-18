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

  /** Get all public posts */
  getAll(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(
      this.apiUrl,
      { withCredentials: true }
    );
  }

  /** Get a single post by id */
  getById(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }

  /** Create a new post */
  create(form: FormData): Observable<BlogPost> {
    return this.http.post<BlogPost>(
      this.apiUrl,
      form,
      { withCredentials: true }
    );
  }

  /** Update an existing post */
  update(id: number, form: FormData): Observable<void> {
    return this.http.put<void>(
      `${this.apiUrl}/${id}`,
      form,
      { withCredentials: true }
    );
  }

  /** Delete a post */
  delete(id: number): Observable<void> {
    const token = this.auth.getToken();
    let headers = new HttpHeaders();

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
      return this.http.delete<void>(
        `${this.apiUrl}/${id}`,
        { headers }
      );
    }

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { withCredentials: true }
    );
  }
}
