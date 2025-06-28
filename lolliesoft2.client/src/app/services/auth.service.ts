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
  roles?: string[];
  role?: string | string[];
  [claim: string]: any;
}

interface MeResponse {
  id: string;
  name: string;
  email: string;
  roles: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = '/api/auth';
  private readonly tokenKey = 'authToken';

  // userId
  private userIdSubject = new BehaviorSubject<string | null>(this.decodeSub());
  public currentUserId$ = this.userIdSubject.asObservable();

  // roles
  private rolesSubject = new BehaviorSubject<string[]>(this.decodeRoles());
  public currentUserRoles$ = this.rolesSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /** Register + store token */
  register(userName: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, { userName, email, password })
      .pipe(tap(res => this.setToken(res.token)));
  }

  /** Login + store token */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { email, password })
      .pipe(tap(res => this.setToken(res.token)));
  }

  /** Fetch current user info (including roles) */
  me(): Observable<MeResponse> {
    return this.http
      .get<MeResponse>(`${this.apiUrl}/me`, { headers: this.authHeaders() })
      .pipe(
        tap(res => {
          this.userIdSubject.next(res.id);
          this.rolesSubject.next(res.roles);
        })
      );
  }

  /** Log out and clear everything */
  logout(): void {
    this.clearToken();
    this.router.navigate(['/']);
  }

  /** True if a token is present */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Raw JWT */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Headers carrying the Bearer token */
  authHeaders(): HttpHeaders {
    const t = this.getToken();
    return t
      ? new HttpHeaders().set('Authorization', `Bearer ${t}`)
      : new HttpHeaders();
  }

  /** Persist token + update subjects */
  public setToken(jwt: string): void {
    localStorage.setItem(this.tokenKey, jwt);
    this.userIdSubject.next(this.decodeSub());
    this.rolesSubject.next(this.decodeRoles());
  }

  /** Clear token + subjects */
  public clearToken(): void {
    localStorage.removeItem(this.tokenKey);
    this.userIdSubject.next(null);
    this.rolesSubject.next([]);
  }

  /** Synchronous helper to read current roles */
  public getCurrentUserRoles(): string[] {
    return this.rolesSubject.value;
  }

  /** Helper to read current user ID */
  public getCurrentUserId(): string | null {
    return this.decodeSub();
  }

  /** Decode the `sub` claim from JWT */
  private decodeSub(): string | null {
    const t = this.getToken();
    if (!t) return null;
    try {
      const payload = JSON.parse(atob(t.split('.')[1])) as JwtPayload;
      return payload.sub;
    } catch {
      return null;
    }
  }

  /** Decode `role`/`roles` or any URI ending `/role` into an array */
  private decodeRoles(): string[] {
    const t = this.getToken();
    if (!t) return [];
    try {
      const payload = JSON.parse(atob(t.split('.')[1])) as JwtPayload;

      // 1. Standard "roles" array
      let raw = payload.roles
        // 2. Or a single/array "role"
        ?? payload.role
        // 3. Or any claim key that ends with "/role"
        ?? Object.keys(payload)
          .filter(k => k.toLowerCase().endsWith('/role'))
          .map(k => payload[k])
          .flat();

      if (!raw) return [];
      return Array.isArray(raw) ? raw : [raw];
    } catch {
      return [];
    }
  }
}
