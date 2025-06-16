// src/app/services/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';

interface LoginResponse { token: string; }

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'authToken';
  private userIdSubject = new BehaviorSubject<string | null>(this.decodeUserId());
  public currentUserId$ = this.userIdSubject.asObservable();

  constructor(private http: HttpClient) { }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>('/api/auth/login', { email, password });
  }

  setToken(jwt: string) {
    localStorage.setItem(this.tokenKey, jwt);
    this.userIdSubject.next(this.decodeUserId());
  }

  clearToken() {
    localStorage.removeItem(this.tokenKey);
    this.userIdSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  logout() {
    this.clearToken();
  }

  getCurrentUserId(): string | null {
    return this.decodeUserId();
  }

  private decodeUserId(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const b64 = token.split('.')[1]
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .padEnd(Math.ceil(token.split('.')[1].length / 4) * 4, '=');
      const payload = JSON.parse(atob(b64)) as { sub?: string, userId?: string };
      return payload.sub ?? payload.userId ?? null;
    } catch {
      return null;
    }
  }
}
