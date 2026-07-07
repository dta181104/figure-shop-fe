import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductItems } from '@/app/core/models/product-item.model';
import { CartService } from '@/app/core/services/cart.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { PaymentService } from '@/app/core/services/payment.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css'],
})
export class CheckoutComponent {
  selectedItems: (ProductItems & { quantity?: number })[] = [];
  total = 0;

  customer = {
    fullName: '',
    email: '',
    phone: '',
    address: '',
  };

  paymentMethod: string = 'cod';

  constructor(
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService,
    private paymentService: PaymentService
  ) {}

  ngOnInit() {
    const nav = history.state as any;
    this.selectedItems = nav.items || [];

    if (!this.selectedItems.length) {
      // alert('Chưa có sản phẩm nào được chọn để thanh toán!');
      this.notificationService.show('warning', 'Chưa có sản phẩm nào được chọn để thanh toán!');
      this.router.navigate(['/cart']);
      return;
    }

    this.total = this.selectedItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  }

  confirmOrder() {
    if (
      !this.customer.fullName ||
      !this.customer.email ||
      !this.customer.phone ||
      !this.customer.address
    ) {
      // alert('Vui lòng điền đầy đủ thông tin nhận hàng!');
      this.notificationService.show('warning', 'Vui lòng điền đầy đủ thông tin nhận hàng!');
      return;
    }

    if (!this.paymentMethod) {
      // alert('Vui lòng chọn phương thức thanh toán!');
      this.notificationService.show('warning', 'Vui lòng chọn phương thức thanh toán!');
      return;
    }

    const itemIds = this.selectedItems.map((i) => i.id);

    // Thanh toán VNPay
    if (this.paymentMethod === 'vnpay') {
      const amount = this.total;
      const orderInfo = `Thanh toan don hang cua ${this.customer.fullName}`;

      localStorage.setItem('checkoutItemIds', JSON.stringify(itemIds));

      this.paymentService.submitOrder({ amount, orderInfo }).subscribe({
        next: (paymentUrl) => {
          window.location.href = paymentUrl;
        },
        error: (err) => {
          console.error(err);
          // alert('Không thể kết nối VNPay. Vui lòng thử lại sau!');
          this.notificationService.show('error', 'Không thể kết nối VNPay. Vui lòng thử lại sau!');
        },
      });
      return;
    }

    // Thanh toán Momo
    if (this.paymentMethod === 'momo') {
      const amount = this.total;
      const orderInfo = generateOrderId();
      console.log('Order Info (MoMo):', orderInfo);
      // const orderInfo = `Thanh toan don hang cua ${this.customer.fullName}-${Date.now()}`;
      const itemIds = this.selectedItems.map((item) => item.id);
      localStorage.setItem('checkoutItemIds', JSON.stringify(itemIds));

      this.paymentService.createMomoPayment({ amount, orderInfo }).subscribe({
        next: (res) => {
          console.log('MoMo response:', res);
          if (res && res.payUrl) {
            window.location.href = res.payUrl;
          } else if (res && res.message) {
            // alert('MoMo trả về: ' + res.message);
          } else {
            // alert('Không nhận được payUrl từ MoMo.');
          }
        },
        error: (err) => {
          console.error(err);
          // alert('Không thể kết nối MoMo. Vui lòng thử lại sau!');
          this.notificationService.show('error', 'Không thể kết nối MoMo. Vui lòng thử lại sau!');
        },
      });
      return;
    }

    // Thanh toán COD
    if (this.paymentMethod === 'cod') {
      localStorage.setItem('checkoutItemIds', JSON.stringify(itemIds));
      this.router.navigate(['/payment-result'], {
        state: {
          gateway: 'cod',
          paymentStatus: 'success',
          amount: this.total,
          itemIds,
        },
      });
    }
  }
}

function generateOrderId(): string {
  const now = new Date();

  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Tháng 0-11
  const day = now.getDate().toString().padStart(2, '0');
  const hours = now.getHours().toString().padStart(2, '0');
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');

  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}
