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
export class SizeService {
  private http = inject(HttpClient);

  getSizes(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('size');
  }

  createSize(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('size', payload);
  }

  updateSize(code: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`size/${code}`, payload);
  }

  deleteSize(code: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`size/${code}`);
  }
}
