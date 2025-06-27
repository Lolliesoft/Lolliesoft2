// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

interface AuthResponse {
  token: string;
}

interface JwtPayload {
  sub: string;
  unique_name?: string;
  email?: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private readonly tokenKey = 'authToken';
  private userIdSubject = new BehaviorSubject<string | null>(this.decodeUserId());
  public currentUserId$ = this.userIdSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /** Register a new user (now includes userName) and store token */
  register(userName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      { userName, email, password }
    ).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  /** Login and store token */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      { email, password }
    ).pipe(
      tap(res => this.setToken(res.token))
    );
  }

  /** Remove token and redirect home */
  logout(): void {
    this.clearToken();
    this.router.navigate(['/']);
  }

  /** True if we have a token */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Raw JWT from localStorage */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** HTTP headers with Bearer token */
  authHeaders(): HttpHeaders {
    const token = this.getToken();
    return token
      ? new HttpHeaders().set('Authorization', `Bearer ${token}`)
      : new HttpHeaders();
  }

  /** Manually set & broadcast a new token */
  setToken(jwt: string): void {
    localStorage.setItem(this.tokenKey, jwt);
    this.userIdSubject.next(this.decodeUserId());
  }

  /** Clear stored token & broadcast null */
  clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.userIdSubject.next(null);
  }

  /** Current user ID parsed from JWT `sub` claim */
  getCurrentUserId(): string | null {
    return this.decodeUserId();
  }

  /** Decode JWT payload to extract `sub` */
  private decodeUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const b64 = parts[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(parts[1].length + (4 - parts[1].length % 4) % 4, '=');
      const payload = JSON.parse(atob(b64)) as JwtPayload;
      return payload.sub ?? null;
    } catch {
      return null;
    }
  }
}
