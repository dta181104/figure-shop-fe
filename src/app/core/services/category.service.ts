import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

type ApiResponse<T> = {
  result?: T;
  code?: number;
  message?: string;
};

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);

  getCategories(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('category');
  }

  createCategory(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('category', payload);
  }

  updateCategory(code: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`category/${code}`, payload);
  }

  deleteCategory(code: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`category/${code}`);
  }

  getCategoryByPage(page: number): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(`category/${page}`);
  }

  getTotalPage(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('category/totalPage');
  }

  findCategories(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('category/find');
  }

  findTotalPage(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('category/findTotalPage');
  }
}
