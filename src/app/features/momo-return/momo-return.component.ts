import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-momo-return',
  standalone: true,
  template: '',
})
export class MomoReturnComponent implements OnInit {
  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      console.log('MoMo params:', params);

      const paymentStatus = params['resultCode'] === '0' ? 'success' : 'fail';
      const state = {
        gateway: 'momo',
        paymentStatus: paymentStatus,
        transactionId: params['transId'],
        amount: params['amount'],
        orderId: params['orderId']
      };

      this.router.navigate(['/payment-result'], { state });
    });
  }
}
