import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { TelegramAuthUser } from '@/shared/tg-login/tg-login';
import { ApiResponse } from '@/shared/types/api.types';
import { User } from '@/shared/types/user.types';
import { AuthData, LoginDto, RegisterDto } from '@/shared/types/auth.types';
import { environment } from 'src/environments/environment.prod';

export type AuthResponse = ApiResponse<AuthData>;
export type LogoutResponse = ApiResponse<null>;
export type SessionStatus = 'loading' | 'ready';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.apiUrl}/auth`;

  private readonly userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();

  private readonly statusSubject = new BehaviorSubject<SessionStatus>('loading');
  readonly status$ = this.statusSubject.asObservable();

  private readonly platformId = inject(PLATFORM_ID);

  private accessToken: string | null = isPlatformBrowser(this.platformId)
    ? localStorage.getItem('access_token')
    : null;

  constructor(private readonly http: HttpClient) {}

  initSession(): Observable<void> {
    if (!this.isBrowser) {
      this.userSubject.next(null);
      this.setStatus('ready');
      return of(void 0);
    }

    this.setStatus('loading');

    const done = () => this.setStatus('ready');

    if (this.getAccessToken()) {
      return this.me().pipe(
        map(() => void 0),
        tap(done),
        catchError(() =>
          this.refresh().pipe(
            switchMap(() => this.me()),
            map(() => void 0),
            tap(done),
            catchError(() => {
              this.clearAuth();
              done();
              return of(void 0);
            }),
          ),
        ),
      );
    }

    return this.refresh().pipe(
      switchMap(() => this.me()),
      map(() => void 0),
      tap(done),
      catchError(() => {
        done();
        return of(void 0);
      }),
    );
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  login(dto: LoginDto): Observable<User | null> {
    return this.http
      .post<AuthResponse>(`${this.API}/login`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.setAccessToken(response.data.accessToken)),
        switchMap(() => this.me()),
      );
  }

  register(dto: RegisterDto): Observable<User | null> {
    return this.http
      .post<AuthResponse>(`${this.API}/register`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.setAccessToken(response.data.accessToken)),
        tap((response) => {
          if (response.data.user) {
            this.userSubject.next(response.data.user);
          }
        }),
        map((response) => response.data.user),
      );
  }

  telegramAuth(user: TelegramAuthUser): Observable<User | null> {
    return this.http
      .post<AuthResponse>(`${this.API}/telegram`, user, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.setAccessToken(response.data.accessToken)),
        tap((response) => {
          if (response.data.user) {
            this.userSubject.next(response.data.user);
          }
        }),
        map((response) => response.data.user),
      );
  }

  me(): Observable<User | null> {
    return this.http.get<ApiResponse<User>>(`${this.API}/me`).pipe(
      map((response) => response.data),
      tap((user) => this.userSubject.next(user)),
    );
  }

  refresh(): Observable<string> {
    return this.http
      .post<AuthResponse>(`${this.API}/refresh`, null, {
        withCredentials: true,
      })
      .pipe(
        tap((response) => this.setAccessToken(response.data.accessToken)),
        map((response) => response.data.accessToken),
      );
  }

  logout(): Observable<void> {
    return this.http.post<LogoutResponse>(`${this.API}/logout`, null).pipe(
      tap(() => this.clearAuth()),
      map(() => void 0),
      catchError((err) => {
        this.clearAuth();
        return throwError(() => err);
      }),
    );
  }

  private setStatus(status: SessionStatus) {
    this.statusSubject.next(status);
  }

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  private setAccessToken(token: string) {
    this.accessToken = token;

    if (!this.isBrowser) return;
    localStorage.setItem('access_token', token);
  }

  private clearAuth() {
    this.accessToken = null;
    this.userSubject.next(null);

    if (!this.isBrowser) return;
    localStorage.removeItem('access_token');
  }
}
