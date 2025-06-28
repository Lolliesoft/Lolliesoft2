// src/app/auth/admin.guard.ts
import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable, of } from 'rxjs';
import { switchMap, map, tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private auth: AuthService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean | UrlTree> {
    // 1) Must be logged in
    if (!this.auth.isLoggedIn()) {
      return of(this.router.createUrlTree(['/login']));
    }

    // 2) Refresh roles via /api/auth/me
    return this.auth.me().pipe(
      // 3) Check for Admin
      map(() => {
        const isAdmin = this.auth.getCurrentUserRoles().includes('Admin');
        return isAdmin || this.router.createUrlTree(['/']);
      }),
      // If /me fails, bail to login
      catchError(() => of(this.router.createUrlTree(['/login'])))
    );
  }
}
