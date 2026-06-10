import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {
  private http = inject(HttpClient);

  // Momo API
  createMomoPayment(payload: any): Observable<any> {
    return this.http.post<any>('momo', payload);
  }

  checkMomoOrderStatus(orderId: string): Observable<any> {
    return this.http.get<any>('momo/order-status', { params: { orderId: orderId } });
  }

  // Payment API
  submitOrder(payload: any): Observable<any> {
    return this.http.post<any>('payment/submitOrder', payload);
  }

  getVnpayPayment(amount: number, orderInfo: string): Observable<any> {
    return this.http.get<any>('payment/vnpay-payment', { params: { amount, orderInfo } });
  }
}
