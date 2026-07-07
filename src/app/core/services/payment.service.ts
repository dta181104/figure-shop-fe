import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PaymentService {
  private http = inject(HttpClient);

  // Vnpay API
  submitOrder(payload: any): Observable<any> {
    return this.http.post('vnpay/submitOrder', null, {
      params: payload,
      responseType: 'text',
    });
  }

  getVnpayPayment(amount: number, orderInfo: string): Observable<any> {
    return this.http.get<any>('vnpay/vnpay-payment', { params: { amount, orderInfo } });
  }

  // Momo API
  createMomoPayment(payload: any): Observable<any> {
    return this.http.post<any>('momo', null, { params: payload });
  }

  checkMomoOrderStatus(orderId: string): Observable<any> {
    return this.http.get<any>('momo/order-status', { params: { orderId: orderId } });
  }
}
