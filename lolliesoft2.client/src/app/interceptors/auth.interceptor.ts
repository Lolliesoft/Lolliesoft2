// src/app/interceptors/auth.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service'; // adjust path if needed

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // 1) Get the stored JWT token (or null if not logged in)
    const token = this.authService.getToken();

    // 2) If there’s no token, just forward the original request
    if (!token) {
      return next.handle(req);
    }

    // 3) Clone the request and set the Authorization header
    const authReq = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });

    // 4) Forward the cloned request (with the header) instead of the original
    return next.handle(authReq);
  }
}
