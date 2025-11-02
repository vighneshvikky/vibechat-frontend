import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const router = inject(Router);
  const http = inject(HttpClient);

  // ✅ Always send cookies (access + refresh)
  const clonedReq = req.clone({ withCredentials: true });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        console.warn('🔄 Access token expired, trying refresh...');

        // Call refresh endpoint
        return http.get('http://localhost:3000/auth/refresh', { withCredentials: true }).pipe(
          switchMap(() => {
            // Retry the original request after successful refresh
            return next(req.clone({ withCredentials: true }));
          }),
          catchError((refreshError: HttpErrorResponse) => {
            console.error('❌ Refresh failed — redirecting to login.', refreshError);
            router.navigate(['/login']);
            return throwError(() => refreshError);
          })
        );
      }

      // Other global errors
      if (error.status >= 500) {
        console.error('💥 Server error:', error.message);
      } else if (error.status === 403) {
        console.warn('🚫 Forbidden - You do not have permission.');
      }

      return throwError(() => error);
    })
  );
};  
