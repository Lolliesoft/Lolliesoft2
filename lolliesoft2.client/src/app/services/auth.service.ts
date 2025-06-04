// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private tokenKey = 'authToken';

  constructor() { }

  /** Call this after a successful login to store the token in localStorage */
  setToken(jwt: string) {
    localStorage.setItem(this.tokenKey, jwt);
  }

  /** Remove the token on logout */
  clearToken() {
    localStorage.removeItem(this.tokenKey);
  }

  /** Called by the interceptor to retrieve the current JWT */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** A simple helper to check whether we have a token */
  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  /** Call this when the user clicks “Logout” */
  logout() {
    this.clearToken();
    // … any additional cleanup …
  }
}
