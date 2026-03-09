import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '@/services/auth.service';
import { ApiResponse } from '@/shared/types/api.types';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/shared/types/categories.types';
import { environment } from 'src/environments/environment';

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly API = `${environment.apiUrl}/categories`;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  getAll(): Observable<ApiResponse<Category[]>> {
    return this.authService.withAutoRefresh(() =>
      this.http.get<ApiResponse<Category[]>>(this.API, {
        headers: this.authService.authHeaders(),
      }),
    );
  }

  getById(id: number): Observable<ApiResponse<Category>> {
    return this.authService.withAutoRefresh(() =>
      this.http.get<ApiResponse<Category>>(`${this.API}/${id}`, {
        headers: this.authService.authHeaders(),
      }),
    );
  }

  create(dto: CreateCategoryDto): Observable<ApiResponse<Category>> {
    return this.authService.withAutoRefresh(() =>
      this.http.post<ApiResponse<Category>>(this.API, dto, {
        headers: this.authService.authHeaders(),
      }),
    );
  }

  update(id: number, dto: UpdateCategoryDto): Observable<ApiResponse<Category>> {
    return this.authService.withAutoRefresh(() =>
      this.http.patch<ApiResponse<Category>>(`${this.API}/${id}`, dto, {
        headers: this.authService.authHeaders(),
      }),
    );
  }

  remove(id: number): Observable<ApiResponse<MessageResponse>> {
    return this.authService.withAutoRefresh(() =>
      this.http.delete<ApiResponse<MessageResponse>>(`${this.API}/${id}`, {
        headers: this.authService.authHeaders(),
      }),
    );
  }
}
