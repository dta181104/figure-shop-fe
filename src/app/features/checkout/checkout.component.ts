import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductItems } from '@/app/core/models/product-item.model';
import { CartService } from '@/app/core/services/cart.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { OrderService } from '@/app/core/services/order.service';
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
    private paymentService: PaymentService,
    private orderService: OrderService
  ) {}

  ngOnInit() {
    const nav = history.state as any;
    this.selectedItems = nav.items || [];

    if (!this.selectedItems.length) {
      this.notificationService.show('warning', 'Chưa có sản phẩm nào được chọn để thanh toán!');
      this.router.navigate(['/cart']);
      return;
    }

    this.loadCustomerInfo();

    this.total = this.selectedItems.reduce(
      (sum, item) => sum + item.price * (item.quantity || 1),
      0
    );
  }

  private loadCustomerInfo(): void {
    try {
      const profileRaw = localStorage.getItem('user_profile');
      if (profileRaw) {
        const profile = JSON.parse(profileRaw);
        const user = profile?.result ?? profile; // Handle both { result: ... } and direct object
        if (user) {
          this.customer.fullName = user.name || '';
          this.customer.email = user.email || '';
          this.customer.phone = user.phone || '';
          this.customer.address = user.address || '';
        }
      }
    } catch (error) {
      console.error('Error loading customer info from localStorage', error);
    }
  }

  confirmOrder() {
    if (
      !this.customer.fullName ||
      !this.customer.email ||
      !this.customer.phone ||
      !this.customer.address
    ) {
      this.notificationService.show('warning', 'Vui lòng điền đầy đủ thông tin nhận hàng!');
      return;
    }

    if (!this.paymentMethod) {
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
          this.notificationService.show('error', 'Không thể kết nối VNPay. Vui lòng thử lại sau!');
        },
      });
      return;
    }

    // Thanh toán Momo
    if (this.paymentMethod === 'momo') {
      const profileRaw = localStorage.getItem('user_profile');
      let customerId = null;
      if (profileRaw) {
        try {
          const profile = JSON.parse(profileRaw);
          const user = profile?.result ?? profile;
          customerId = user?.id;
        } catch (e) {
          console.error('Could not parse user profile for customerId', e);
        }
      }

      const billData = {
        paymentId: 1, // 1 là ID cho phương thức MoMo
        customerId: customerId,
        customerName: this.customer.fullName,
        phone: this.customer.phone,
        email: this.customer.email,
        address: this.customer.address,
        note: '', // Có thể thêm trường note vào form nếu cần
        products: this.selectedItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      localStorage.setItem('checkoutItemIds', JSON.stringify(itemIds));

      this.paymentService.createMomoPayment(billData).subscribe({
        next: (res) => {
          if (res?.payUrl) {
            this.removeCheckoutItemIds();
            console.log('Redirecting to MoMo payment URL:', res.payUrl);
            window.location.href = res.payUrl;
          } else {
            this.notificationService.show('error', 'Không nhận được URL thanh toán từ MoMo.');
          }
        },
        error: (err) => {
          this.notificationService.show('error', err?.error?.message || 'Không thể kết nối MoMo.');
        },
      });
      return;
    }

    // Thanh toán COD
    if (this.paymentMethod === 'cod') {
      const profileRaw = localStorage.getItem('user_profile');
      let customerId = null;
      if (profileRaw) {
        try {
          const profile = JSON.parse(profileRaw);
          const user = profile?.result ?? profile;
          customerId = user?.id;
        } catch (e) {
          console.error('Could not parse user profile for customerId', e);
        }
      }

      const billData = {
        paymentId: 5, // 5 là ID cho phương thức COD
        customerId: customerId,
        customerName: this.customer.fullName,
        phone: this.customer.phone,
        email: this.customer.email,
        address: this.customer.address,
        products: this.selectedItems.map((item) => ({
          productId: item.id,
          quantity: item.quantity || 1,
        })),
      };

      this.orderService.createBill(billData).subscribe({
        next: (response) => {
          this.notificationService.show('success', 'Đặt hàng thành công!');
          // Xóa các sản phẩm đã mua khỏi giỏ hàng
          itemIds.forEach((id) => this.cartService.removeItem(id));
          // Chuyển hướng đến trang lịch sử đơn hàng
          this.router.navigate(['/order-history']);
        },
        error: (err) => {
          this.notificationService.show(
            'error',
            err?.error?.message || 'Đã có lỗi xảy ra khi tạo đơn hàng.'
          );
        },
      });
    }
  }

  removeCheckoutItemIds(): void {
    const itemIdsString = localStorage.getItem('checkoutItemIds');
    if (itemIdsString) {
      try {
        const itemIds: number[] = JSON.parse(itemIdsString);

        // Sử dụng đúng instance được Angular quản lý để xóa vật phẩm khỏi giỏ hàng
        itemIds.forEach((id) => {
          this.cartService.removeItem(id);
        });

        localStorage.removeItem('checkoutItemIds');
      } catch (e) {
        console.error('Error parsing checkoutItemIds from localStorage', e);
      }
    }
  }
}
