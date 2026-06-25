import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderService } from '../../core/services/order.service';
import { UserService } from '../../core/services/user.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-history.component.html',
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
          error: () => this.isLoading = false
        });
      },
      error: () => this.isLoading = false
    });
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      '1': 'Chờ xác nhận',
      '2': 'Đã xác nhận',
      '3': 'Đang giao hàng',
      '4': 'Hoàn thành',
      '5': 'Đã hủy'
    };
    return statusMap[status] || 'Đã xác nhận';
  }

  cancelOrder(orderId: number): void {
    if (confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      this.orderService.updateBill(orderId, { status: 'CANCELLED' }).subscribe({
        next: () => {
          alert('Hủy đơn hàng thành công');
          this.loadUserAndOrders();
        },
        error: (err) => alert('Lỗi khi hủy đơn: ' + err.message)
      });
    }
  }
}