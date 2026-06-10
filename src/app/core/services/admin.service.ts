import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export type AdminUser = {
  id?: number;
  code?: string;
  username?: string;
  name?: string;
  fullName?: string;
  email?: string;
  phone?: string;
  status?: string | number;
  roles?: Array<string | { code?: string; name?: string }>;
};

export type ApiResponse<T> = {
  result?: T;
  code?: number;
  message?: string;
};

export type PaginatedResult<T> = {
  content: T[];
  pageable?: any;
  totalPages?: number;
  totalElements?: number;
  last?: boolean;
  size?: number;
  number?: number;
  sort?: any;
  numberOfElements?: number;
  first?: boolean;
  empty?: boolean;
};

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);

  getMyInfo(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>('users/myInfo');
  }

  getAccounts(pageIndex: number = 1, pageSize: number = 10, keyword?: string): Observable<ApiResponse<PaginatedResult<AdminUser>>> {
    let params = new HttpParams()
      .set('pageIndex', pageIndex.toString())
      .set('pageSize', pageSize.toString());
      
    if (keyword) {
      params = params.set('keyword', keyword);
    }
    return this.http.get<ApiResponse<PaginatedResult<AdminUser>>>('admin/accounts', { params });
  }

  findAccount(code: string): Observable<ApiResponse<AdminUser>> {
    return this.http.get<ApiResponse<AdminUser>>(`admin/find/${code}`);
  }

  createAccount(payload: {
    username: string;
    password?: string;
    pass?: string;
    name?: string;
    email?: string;
    phone?: string;
  }): Observable<ApiResponse<AdminUser>> {
    return this.http.post<ApiResponse<AdminUser>>('admin/create', payload);
  }

  updateAccount(
    code: string,
    payload: {
      name?: string;
      email?: string;
      phone?: string;
      status?: string;
      pass?: string;
    }
  ): Observable<ApiResponse<AdminUser>> {
    return this.http.put<ApiResponse<AdminUser>>(`admin/update/${code}`, payload);
  }

  deleteAccount(code: string): Observable<ApiResponse<AdminUser>> {
    return this.http.delete<ApiResponse<AdminUser>>(`admin/delete/${code}`);
  }
}
