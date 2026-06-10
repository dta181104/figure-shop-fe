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
export class UserService {
  private http = inject(HttpClient);

  getMyInfo(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('users/myInfo');
  }

  register(payload: any): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>('users/register', payload);
  }

  updateUser(code: string, payload: any): Observable<ApiResponse<any>> {
    return this.http.put<ApiResponse<any>>('users/' + code, payload);
  }

  deleteUser(code: string): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>('users/' + code);
  }
}
