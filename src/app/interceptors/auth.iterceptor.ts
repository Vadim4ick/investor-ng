import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '@/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private auth: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const access = this.auth.getAccessToken();
    const isAuthCall = /\/(login|register|refresh)\b/.test(req.url);

    // refresh/login/register должны отправлять cookie
    // плюс любые запросы к API, где нужна cookie (если фронт и бэк на разных доменах)
    const withCreds = req.clone({ withCredentials: true });

    const authReq =
      access && !isAuthCall
        ? withCreds.clone({
            setHeaders: { Authorization: `Bearer ${access}` },
          })
        : withCreds;

    return next.handle(authReq).pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401 && !isAuthCall) {
          return this.auth.refresh().pipe(
            switchMap(() => {
              const newAccess = this.auth.getAccessToken();
              const retryReq = newAccess
                ? req.clone({
                    withCredentials: true,
                    setHeaders: { Authorization: `Bearer ${newAccess}` },
                  })
                : req.clone({ withCredentials: true });
              return next.handle(retryReq);
            }),
            catchError((e) => throwError(() => e)),
          );
        }
        return throwError(() => err);
      }),
    );
  }
}
