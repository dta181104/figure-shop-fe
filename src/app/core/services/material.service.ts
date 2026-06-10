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
export class MaterialService {
  private http = inject(HttpClient);

  getMaterials(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('material');
  }

  createMaterial(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('material', payload);
  }

  updateMaterial(code: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`material/${code}`, payload);
  }

  deleteMaterial(code: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`material/${code}`);
  }
}
