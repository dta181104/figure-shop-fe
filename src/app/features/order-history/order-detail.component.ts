import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '@/app/core/services/order.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { finalize } from 'rxjs/operators';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-history.component.css', './order-detail.component.css'],
})
export class OrderDetailComponent implements OnInit {
  order: any = null;
  isLoading = false;
  error: string | null = null;

  // Confirm Dialog
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Xác nhận';
  confirmVariant: 'primary' | 'warning' | 'danger' = 'warning';
  private confirmAction: (() => void) | null = null;

  private route = inject(ActivatedRoute);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  ngOnInit(): void {
    const orderId = this.route.snapshot.paramMap.get('id');
    if (orderId) {
      this.loadOrderDetail(orderId);
    } else {
      this.error = 'Không tìm thấy mã đơn hàng.';
    }
  }

  loadOrderDetail(id: string): void {
    this.isLoading = true;
    this.error = null;
    this.orderService
      .getById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.order = res?.result ?? res;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Đã xảy ra lỗi khi tải chi tiết đơn hàng.';
        },
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

  getPaymentMethodLabel(method: string): string {
    const methodMap: { [key: string]: string } = {
      '1': 'Thanh toán khi nhận hàng (COD)',
      '2': 'Thanh toán qua VNPAY',
      '3': 'Thanh toán qua MOMO',
    };
    return methodMap[String(method)] || 'Chưa xác định';
  }

  canCancel(order: any): boolean {
    // Cho phép hủy khi đơn hàng đang ở trạng thái 'Chờ thanh toán' hoặc 'Chờ xác nhận'
    return ['1', '2'].includes(String(order.status));
  }

  cancelOrder(orderId: number): void {
    this.openConfirm({
      title: 'Xác nhận hủy đơn hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      confirmText: 'Hủy đơn hàng',
      variant: 'danger',
      action: () => {
        this.isLoading = true;
        this.orderService
          .updateBill(orderId, { status: '6' })
          .pipe(finalize(() => (this.isLoading = false)))
          .subscribe({
            next: () => {
              this.notificationService.show('success', 'Hủy đơn hàng thành công');
              if (this.order) {
                this.order.status = '6'; // Cập nhật trạng thái trên UI ngay lập tức
              }
            },
            error: (err) => {
              const errorMessage = err?.error?.message || 'Đã xảy ra lỗi khi hủy đơn hàng.';
              this.notificationService.show('error', errorMessage);
            },
          });
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/order-history']);
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
