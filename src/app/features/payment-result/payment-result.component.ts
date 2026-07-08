import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { CartService } from '@/app/core/services/cart.service';

@Component({
  selector: 'app-payment-result',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-result.component.html',
  styleUrls: ['./payment-result.component.css'],
})
export class PaymentResultComponent implements OnInit {
  paymentInfo: any = null;
  gateway: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const state = history.state;

    if (!state || !state.paymentStatus) {
      this.router.navigate(['/']);
      return;
    }

    this.paymentInfo = state;
    this.gateway = state.gateway === 'vnpay' ? 'VNPay' : state.gateway === 'momo' ? 'MoMo' : 'COD';
    // const itemIdsString = localStorage.getItem('checkoutItemIds');
    // if (state.paymentStatus === 'success' && itemIdsString) {
    //   const itemIds: number[] = JSON.parse(itemIdsString);
    //   itemIds.forEach((id) => this.cartService.removeItem(id));
    //   localStorage.removeItem('checkoutItemIds');
    // }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
