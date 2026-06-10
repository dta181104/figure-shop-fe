import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  login(username: string, password: string) {
    return this.http.post<{ result: { token: string } }>(`auth/token`, { username, password }).pipe(
      tap((response) => {
        if (response?.result?.token) {
          localStorage.setItem('access_token', response.result.token);
        }
      })
    );
  }

  introspect(token: string): Observable<any> {
    return this.http.post('auth/introspect', { token });
  }

  logoutApi(token: string): Observable<any> {
    return this.http.post('auth/logout', { token }).pipe(
      tap(() => this.logout())
    );
  }

  refresh(token: string): Observable<any> {
    return this.http.post('auth/refresh', { token });
  }

  forgotPassword(email: string, username: string): Observable<any> {
    return this.http.post(`auth/forgot-password?email=${email}&username=${username}`, {});
  }

  verifyCode(email: string, token: string): Observable<any> {
    return this.http.post(`auth/verify-code?email=${email}&token=${token}`, {});
  }

  resetPassword(email: string, newPassword: string): Observable<any> {
    return this.http.post(`auth/reset-password?email=${email}&newPassword=${newPassword}`, {});
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }
}
