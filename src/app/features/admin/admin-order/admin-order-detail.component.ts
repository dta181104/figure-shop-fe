import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { OrderService } from '@/app/core/services/order.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { finalize, switchMap } from 'rxjs/operators';
import { of } from 'rxjs';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-admin-order-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmDialogComponent],
  templateUrl: './admin-order-detail.component.html',
  styleUrls: ['../admin.component.css', './admin-order-detail.component.css'],
})
export class AdminOrderDetailComponent implements OnInit {
  order: any = null;
  isLoading = true;
  error: string | null = null;

  // Confirm Dialog
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Xác nhận';
  confirmVariant: 'primary' | 'warning' | 'danger' = 'warning';
  private confirmAction: (() => void) | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: OrderService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (id) {
            this.isLoading = true;
            return this.orderService.getById(id);
          }
          this.error = 'Không tìm thấy ID đơn hàng.';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe({
        next: (res) => {
          if (res && res.result) {
            this.order = res.result;
            this.error = null;
          } else if (res) {
            // Xử lý trường hợp API trả về không có trường 'result'
            this.order = res;
            this.error = null;
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err?.error?.message || 'Đã xảy ra lỗi khi tải chi tiết đơn hàng.';
          this.isLoading = false;
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
    switch (method) {
      case 'COD':
        return 'Thanh toán khi nhận hàng (COD)';
      case 'MOMO':
        return 'Thanh toán qua ví MoMo';
      default:
        return 'Chưa xác định';
    }
  }

  calculateSubtotal(item: any): number {
    return item.price * item.quantity;
  }

  updateStatus(newStatus: string, successMessage: string): void {
    if (!this.order) return;

    this.isLoading = true;
    this.orderService
      .updateBill(this.order.id, { status: newStatus })
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.order.status = newStatus;
          this.notificationService.show('success', successMessage);
        },
        error: (err) => {
          const errorMessage = err?.error?.message || 'Đã xảy ra lỗi khi cập nhật trạng thái.';
          this.notificationService.show('error', errorMessage);
        },
      });
  }

  canConfirm(order: any): boolean {
    return String(order?.status) === '2';
  }

  canCancel(order: any): boolean {
    return ['1', '2', '3', '4'].includes(String(order?.status));
  }

  canShip(order: any): boolean {
    return String(order?.status) === '3';
  }

  canComplete(order: any): boolean {
    return String(order?.status) === '4';
  }

  confirmOrder(): void {
    this.openConfirm({
      title: 'Xác nhận đơn hàng',
      message: 'Bạn có chắc chắn muốn xác nhận đơn hàng này?',
      confirmText: 'Xác nhận',
      variant: 'primary',
      action: () => this.updateStatus('3', 'Xác nhận đơn hàng thành công.'),
    });
  }

  shipOrder(): void {
    this.openConfirm({
      title: 'Xác nhận giao hàng',
      message: 'Bạn có chắc chắn muốn chuyển đơn hàng sang trạng thái "Đang giao hàng"?',
      confirmText: 'Xác nhận',
      variant: 'primary',
      action: () => this.updateStatus('4', 'Cập nhật trạng thái "Đang giao hàng" thành công.'),
    });
  }

  completeOrder(): void {
    this.openConfirm({
      title: 'Xác nhận hoàn thành',
      message: 'Bạn có chắc chắn muốn hoàn thành đơn hàng này?',
      confirmText: 'Hoàn thành',
      variant: 'primary',
      action: () => this.updateStatus('5', 'Hoàn thành đơn hàng thành công.'),
    });
  }

  cancelOrder(): void {
    this.openConfirm({
      title: 'Xác nhận hủy đơn hàng',
      message: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
      confirmText: 'Hủy đơn hàng',
      variant: 'danger',
      action: () => this.updateStatus('6', 'Hủy đơn hàng thành công.'),
    });
  }

  goBack(): void {
    this.router.navigate(['/admin/orders']);
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
