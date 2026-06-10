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
export class PermissionService {
  private http = inject(HttpClient);

  getPermissions(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('permissions');
  }

  createPermission(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('permissions', payload);
  }

  deletePermission(code: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`permissions/${code}`);
  }
}
