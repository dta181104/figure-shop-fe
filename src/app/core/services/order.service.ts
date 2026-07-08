import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private baseUrl = environment.apiUrl + '/bills';

  constructor(private http: HttpClient) {}

  /** Tạo mới một hóa đơn */
  createBill(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  /** Lấy tất cả hóa đơn */
  getAll(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}`, { params });
  }

  /** Lấy tất cả hóa đơn của 1 khách hàng */
  getBillsByCustomerId(customerId: string | number): Observable<any> {
    return this.http.get(`${this.baseUrl}/user/${customerId}`);
  }

  /** Lấy hóa đơn theo ID */
  getById(id: string | number): Observable<any> {
    return this.http.get(`${this.baseUrl}/${id}`);
  }

  /** Cập nhật hóa đơn */
  updateBill(id: string | number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  /** Xóa hóa đơn */
  deleteBill(id: string | number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}
