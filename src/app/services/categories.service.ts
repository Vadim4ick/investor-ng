import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, Observable } from 'rxjs';

import { AuthService } from '@/services/auth.service';
import { ApiResponse } from '@/shared/types/api.types';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/shared/types/categories.types';
import { environment } from 'src/environments/environment';
import { isPlatformBrowser } from '@angular/common';

export interface MessageResponse {
  message: string;
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private readonly API = `${environment.apiUrl}/categories`;
  private readonly platformId = inject(PLATFORM_ID);

  constructor(private readonly http: HttpClient) {}

  getAll(): Observable<ApiResponse<Category[]>> {
    if (!isPlatformBrowser(this.platformId)) {
      return EMPTY;
    }

    return this.http.get<ApiResponse<Category[]>>(this.API);
  }

  getById(id: number): Observable<ApiResponse<Category>> {
    return this.http.get<ApiResponse<Category>>(`${this.API}/${id}`);
  }

  create(dto: CreateCategoryDto): Observable<ApiResponse<Category>> {
    console.log(dto);
    return this.http.post<ApiResponse<Category>>(this.API, dto);
  }

  update(id: number, dto: UpdateCategoryDto): Observable<ApiResponse<Category>> {
    return this.http.patch<ApiResponse<Category>>(`${this.API}/${id}`, dto);
  }

  remove(id: number): Observable<ApiResponse<MessageResponse>> {
    return this.http.delete<ApiResponse<MessageResponse>>(`${this.API}/${id}`);
  }
}
