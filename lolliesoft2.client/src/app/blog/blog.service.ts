import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BlogPost } from './blog-post.model';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly apiUrl = '/api/blog';

  constructor(private http: HttpClient) { }

  /** Get all public posts */
  getAll(): Observable<BlogPost[]> {
    return this.http.get<BlogPost[]>(this.apiUrl);
  }

  /** Get a single post by id */
  get(id: number): Observable<BlogPost> {
    return this.http.get<BlogPost>(`${this.apiUrl}/${id}`);
  }

  /** Create a new post */
  create(form: FormData): Observable<BlogPost> {
    return this.http.post<BlogPost>(this.apiUrl, form);
  }

  /** Update an existing post */
  update(id: number, form: FormData): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, form);
  }

  /** Delete a post */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
