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
export class RoleService {
  private http = inject(HttpClient);

  getRoles(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('roles');
  }

  createRole(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('roles', payload);
  }

  updateRole(roleID: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>(`roles/${roleID}`, payload);
  }

  deleteRole(id: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`roles/${id}`);
  }
}
