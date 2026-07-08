import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { PaymentService } from '@/app/core/services/payment.service';

@Component({
  selector: 'app-momo-return',
  standalone: true,
  template: '',
})
export class MomoReturnComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute,    private paymentService: PaymentService,
) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('MoMo params:', params);

      this.paymentService.checkMomoOrderStatus(params['orderId']).subscribe({
        next: (res) => {
          console.log('MoMo order status response:', res);
          const paymentStatus = res?.status === 'success' ? 'success' : 'fail';
          const state = {
            gateway: 'momo',
            paymentStatus: paymentStatus,
            transactionId: res?.transId,
            amount: res?.amount,
            orderId: res?.orderId
          };
          console.log('Navigating to payment result with state:', state);
          this.router.navigate(['/payment-result'], { state });
        },
        error: (err) => {
          console.error('Error checking MoMo order status:', err);
        }
      });
    

      // const paymentStatus = params['resultCode'] === '0' ? 'success' : 'fail';
      // const state = {
      //   gateway: 'momo',
      //   paymentStatus: paymentStatus,
      //   transactionId: params['transId'],
      //   amount: params['amount'],
      //   orderId: params['orderId']
      // };

      // console.log('Navigating to payment result with state:', state);

      // this.router.navigate(['/payment-result'], { state });
    });
  }
}
