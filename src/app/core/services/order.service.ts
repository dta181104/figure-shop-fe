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

  /** Gọi API lấy URL thanh toán MoMo */
  getPayUrlMoMo(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/thanhtoan/momo`, data);
  }

  /** Xác minh thanh toán MoMo */
  verifyMoMo(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/thanhtoan/momo/verify`, data);
  }

  /** Xác minh thanh toán VNPay */
  verifyVNPAY(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/thanhtoan/vnpay/verify`, data);
  }
}
