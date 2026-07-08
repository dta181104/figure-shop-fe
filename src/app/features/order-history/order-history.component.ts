import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OrderService } from '@/app/core/services/order.service';
import { UserService } from '@/app/core/services/user.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css'],
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  isLoading = false;

  // Confirm Dialog
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Xác nhận';
  confirmVariant: 'primary' | 'warning' | 'danger' = 'warning';
  private confirmAction: (() => void) | null = null;

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private notificationService: NotificationService
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
    this.openConfirm({
      title: 'Xác nhận hủy đơn hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      confirmText: 'Hủy đơn hàng',
      variant: 'danger',
      action: () => {
        this.orderService.updateBill(orderId, { status: '6' }).subscribe({
          next: () => {
            this.notificationService.show('success', 'Hủy đơn hàng thành công');
            this.loadUserAndOrders();
          },
          error: (err) => this.notificationService.show('error', 'Lỗi khi hủy đơn: ' + err.message),
        });
      },
    });
  }

  private openConfirm(config: any): void {
    this.confirmTitle = config.title;
    this.confirmMessage = config.message;
    this.confirmText = config.confirmText || 'Xác nhận';
    this.confirmVariant = config.variant || 'warning';
    this.confirmAction = config.action;
    this.confirmVisible = true;
  }

  confirmActionNow(): void {
    if (this.confirmAction) this.confirmAction();
    this.confirmVisible = false;
  }

  closeConfirm(): void {
    this.confirmVisible = false;
  }
}
