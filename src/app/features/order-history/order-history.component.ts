import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;

  constructor(
    private orderService: OrderService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadUserAndOrders();
  }

  loadUserAndOrders(): void {
    this.isLoading = true;
    // Bước 1: Lấy thông tin User đang đăng nhập
    this.userService.getMyInfo().subscribe({
      next: (userRes) => {
        const userId = userRes.result.id;
        // Bước 2: Lấy danh sách đơn hàng theo Customer ID
        this.orderService.getBillsByCustomerId(userId).subscribe({
          next: (orderRes) => {
            this.orders = orderRes.result?.content || [];
            this.isLoading = false;
          },
          error: () => (this.isLoading = false),
        });
      },
      error: () => (this.isLoading = false),
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      '1': 'Chờ thanh toán',
      '2': 'Chờ xác nhận',
      '3': 'Đã xác nhận',
      '4': 'Đang giao hàng',
      '5': 'Giao hàng thành công',
      '6': 'Đã hủy',
    };
    return statusMap[String(status)] || 'Không rõ trạng thái';
  }

  getStatusClass(status: string): string {
    const statusClassMap: { [key: string]: string } = {
      '1': 'pending-payment',
      '2': 'pending-confirmation',
      '3': 'confirmed',
      '4': 'shipping',
      '5': 'delivered',
      '6': 'cancelled',
    };

    return statusClassMap[String(status)] || 'unknown';
  }

  cancelOrder(orderId: number): void {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      this.orderService.updateBill(orderId, { status: '6' }).subscribe({
        next: () => {
          alert('Hủy đơn hàng thành công');
          this.loadUserAndOrders();
        },
        error: (err) => alert('Lỗi khi hủy đơn: ' + err.message),
      });
    }
  }
}
