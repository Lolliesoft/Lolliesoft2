import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';

interface LoginResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly tokenKey = 'blog_jwt';

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Registers a new user.
   */
  register(email: string, password: string): Observable<any> {
    return this.http.post<any>('/api/auth/register', { email, password });
  }

  /**
   * Logs in and stores the JWT.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>('/api/auth/login', { email, password })
      .pipe(tap(response => {
        localStorage.setItem(this.tokenKey, response.token);
      }));
  }

  /**
   * Logs out the current user.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  /**
   * Retrieves the stored JWT.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Returns true if a token is present (logged in).
   */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}
