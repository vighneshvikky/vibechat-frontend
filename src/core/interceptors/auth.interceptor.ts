import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
  HttpEvent,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { ToastrService } from 'ngx-toastr';

export const AuthInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const toastr = inject(ToastrService);

  const clonedReq = req.clone({ withCredentials: true });

  return next(clonedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      console.error('🚨 Intercepted error:', error);

      if (error.status === 401) {
        if (
          !req.url.includes('/auth/refresh') &&
          !req.url.includes('/auth/login') &&
          !req.url.includes('/auth/register')
        ) {
          console.warn('🔄 Access token expired, trying refresh...');

          return http
            .get(`${environment.apiUrl}/auth/refresh`, {
              withCredentials: true,
            })
            .pipe(
              switchMap(() => next(req.clone({ withCredentials: true }))),
              catchError((refreshError: HttpErrorResponse) => {
                console.error('❌ Refresh failed:', refreshError);
                toastr.error(
                  'Session expired. Please log in again.',
                  'Authentication Error'
                );
                router.navigate(['/login']);
                return throwError(() => refreshError);
              })
            );
        }

        if (
          req.url.includes('/auth/login') ||
          req.url.includes('/auth/register')
        ) {
          const message =
            error.error?.message || 'Invalid credentials. Please try again.';
          toastr.error(message, 'Unauthorized');
          return throwError(() => error);
        }
      }

      if (error.status >= 500) {
        toastr.error('Server error. Please try again later.', 'Error');
      } else if (error.status === 403) {  
        toastr.warning(
          'You do not have permission for this action.',
          'Forbidden'
        );
      } else if (error.error?.message) {
        toastr.error(error.error.message, 'Error');
      } else if (typeof error.error === 'string') {
        toastr.error(error.error, 'Error');
      } else {
        toastr.error('An unexpected error occurred.', 'Error');
      }

      return throwError(() => error);
    })
  );
};
