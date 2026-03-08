import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, of, switchMap, tap, throwError } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { TelegramAuthUser } from '@/shared/tg-login/tg-login';

export type LoginDto = { email: string; password: string };
export type RegisterDto = {
  email: string;
  password: string;
  // добавь поля из CreateUserDto при необходимости:
  // name?: string;
};

export type TokenResponseDto = { access_token: string };
export type RegisterResponse = { access_token: string; user: User };

export type JwtPayloadUser = {
  sub: number;
  email: string;
  // любые поля, которые ты кладёшь в access payload / req.user
};

export type User = {
  id: number;
  email: string;
  // опционально: name, role и т.д.
};

export type SessionStatus = 'loading' | 'ready';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Подстрой под env
  private readonly API = 'http://localhost:8000';

  private userSubject = new BehaviorSubject<User | null>(null);
  readonly user$ = this.userSubject.asObservable();

  private statusSubject = new BehaviorSubject<SessionStatus>('loading');
  readonly status$ = this.statusSubject.asObservable();

  constructor(private http: HttpClient) {}

  private platformId = inject(PLATFORM_ID);

  private accessToken: string | null = isPlatformBrowser(this.platformId)
    ? localStorage.getItem('access_token')
    : null;

  initSession(): Observable<void> {
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
  /** true если есть access в памяти/стораже */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  private setStatus(status: SessionStatus) {
    this.statusSubject.next(status);
  }

  /** удобный геттер */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /** Логин → ставит refresh cookie на бэке, возвращает access_token */
  login(dto: LoginDto): Observable<void> {
    return this.http
      .post<TokenResponseDto>(`${this.API}/login`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((r) => this.setAccessToken(r.access_token)),
        switchMap(() => this.me().pipe(map(() => void 0))),
      );
  }

  telegramAuth(user: TelegramAuthUser) {
    return this.http.post<{ access_token: string; user: any }>(`${this.API}/auth/telegram`, user, {
      withCredentials: true,
    });
  }

  /** Регистрация → ставит refresh cookie, возвращает access_token + user */
  register(dto: RegisterDto): Observable<User> {
    return this.http
      .post<RegisterResponse>(`${this.API}/register`, dto, {
        withCredentials: true,
      })
      .pipe(
        tap((r) => this.setAccessToken(r.access_token)),
        tap((r) => this.userSubject.next(r.user)),
        map((r) => r.user),
      );
  }

  /** /me (нужен Authorization: Bearer access) */
  me(): Observable<User> {
    return this.http
      .get<User>(`${this.API}/me`, {
        headers: this.authHeaders(),
      })
      .pipe(tap((u) => this.userSubject.next(u)));
  }

  /** Refresh по httpOnly cookie → новый access_token, и refresh cookie ротируется */
  refresh(): Observable<string> {
    return this.http
      .post<TokenResponseDto>(`${this.API}/refresh`, null, {
        withCredentials: true,
      })
      .pipe(
        tap((r) => this.setAccessToken(r.access_token)),
        map((r) => r.access_token),
      );
  }

  /** Logout → чистит refresh cookie на бэке и на клиенте, сбрасывает состояние */
  logout(): Observable<void> {
    // endpoint защищён JwtAuthGuard → нужен access
    return this.http
      .post<{ ok: true }>(`${this.API}/logout`, null, {
        withCredentials: true,
        headers: this.authHeaders(),
      })
      .pipe(
        tap(() => this.clearAuth()),
        map(() => void 0),
        catchError((err) => {
          // даже если access умер — локально всё равно чистим
          this.clearAuth();
          return throwError(() => err);
        }),
      );
  }

  /** Обёртка: если access умер, пытаемся refresh и повторяем запрос */
  withAutoRefresh<T>(requestFactory: () => Observable<T>): Observable<T> {
    return requestFactory().pipe(
      catchError((err: unknown) => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return this.refresh().pipe(
            switchMap(() => requestFactory()),
            catchError((e) => {
              this.clearAuth();
              return throwError(() => e);
            }),
          );
        }
        return throwError(() => err);
      }),
    );
  }

  // ---------- helpers ----------

  private authHeaders(): HttpHeaders {
    const token = this.accessToken;
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
  }

  private get isBrowser() {
    return isPlatformBrowser(this.platformId);
  }

  private setAccessToken(token: string) {
    if (!this.isBrowser) return;
    this.accessToken = token;
    localStorage.setItem('access_token', token);
  }

  private clearAuth() {
    if (!this.isBrowser) return;
    this.accessToken = null;
    localStorage.removeItem('access_token');
    this.userSubject.next(null);
  }
}
