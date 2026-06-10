import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@/environments/environment';
@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = environment.apiUrl + '/orders';

  constructor(private http: HttpClient) {}

  /** Lấy tất cả đơn hàng */
  getAll(params: { page?: number; limit?: number; sort?: string }): Observable<any> {
    const { page = 1, limit, sort = 'createdAt:desc' } = params;
    const httpParams = new HttpParams()
      .set('pageNo', page)
      .set('pageSize', limit || '')
      .set('sortBy', sort);
    return this.http.get(`${this.baseUrl}/`, { params: httpParams });
  }

  /** Lấy tất cả đơn hàng của 1 user */
  getAllOrderOfUser(params: { page?: number; limit?: number; sort?: string; userId: string }): Observable<any> {
    const { page = 1, limit, sort = 'createdAt:desc', userId } = params;
    const httpParams = new HttpParams()
      .set('pageNo', page)
      .set('pageSize', limit || '')
      .set('sortBy', sort)
      .set('userId', userId);
    return this.http.get(`${this.baseUrl}/user`, { params: httpParams });
  }

  /** Lấy đơn hàng theo ID */
  getById(id: string, userId: string): Observable<any> {
    const httpParams = new HttpParams().set('userId', userId);
    return this.http.get(`${this.baseUrl}/${id}`, { params: httpParams });
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

  /** Tạo đơn hàng mới */
  create(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/`, data);
  }

  /** Cập nhật PaymentId */
  updatePaymentId(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/paymentId`, data);
  }

  /** Cập nhật trạng thái đơn hàng */
  updateOrderStatus(id: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}/order-status`, data);
  }
}

