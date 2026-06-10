import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-vnpay-return',
  standalone: true,
  template: '',
})
export class VnpayReturnComponent implements OnInit {
  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((query) => {
      const success = query['vnp_ResponseCode'] === '00';
      const amount = Number(query['vnp_Amount']) / 100;
      const itemIds = history.state.itemIds || [];

      this.router.navigate(['/payment-result'], {
        state: {
          gateway: 'vnpay',
          paymentStatus: success ? 'success' : 'fail',
          transactionId: query['vnp_TransactionNo'],
          amount: amount,
          bankCode: query['vnp_BankCode'],
          itemIds: itemIds,
        },
      });
    });
  }
}
