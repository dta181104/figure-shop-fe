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
export class BrandService {
  private http = inject(HttpClient);

  getBrands(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('brand');
  }

  createBrand(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('brand', payload);
  }

  updateBrand(code: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`brand/${code}`, payload);
  }

  deleteBrand(code: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`brand/${code}`);
  }
}
