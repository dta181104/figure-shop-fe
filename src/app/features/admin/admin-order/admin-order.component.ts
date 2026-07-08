import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { Router } from '@angular/router';
import { OrderService } from '../../../core/services/order.service';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';
import { NotificationService } from '@/app/core/services/notification.service';

@Component({
  selector: 'app-admin-order',
  templateUrl: './admin-order.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, NzTableModule, ConfirmDialogComponent],
  styleUrls: ['../admin.component.css', './admin-order.component.css'],
})
export class AdminOrderComponent implements OnInit {
  orders: any[] = [];
  totalOrders = 0;
  pageIndex = 1;
  pageSize = 10;
  isLoading = false;

  // Confirm Dialog
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Xác nhận';
  confirmVariant: 'primary' | 'warning' | 'danger' = 'warning';
  private confirmAction: (() => void) | null = null;

  readonly statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: '1', label: 'Chờ thanh toán' },
    { value: '2', label: 'Chờ xác nhận' },
    { value: '3', label: 'Đã xác nhận' },
    { value: '4', label: 'Đang giao hàng' },
    { value: '5', label: 'Giao hàng thành công' },
    { value: '6', label: 'Đã hủy' },
  ];

  filterParams = {
    keyword: '',
    status: '',
    fromDate: '',
    toDate: '',
  };

  constructor(
    private orderService: OrderService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.scrollToTop();
    this.isLoading = true;
    const params = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      ...this.filterParams,
    };

    this.orderService.getAll(params).subscribe({
      next: (res: any) => {
        // Kiểm tra nếu API trả về List trực tiếp thay vì đối tượng Page
        if (Array.isArray(res?.result)) {
          this.orders = res.result;
          this.totalOrders = res.result.length;
        } else {
          this.orders = res?.result?.content || [];
          this.totalOrders = res?.result?.totalElements || 0;
        }
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // Handle error toast
      },
    });
  }

  applyFilters(): void {
    this.pageIndex = 1;
    this.loadOrders();
  }

  clearFilters(): void {
    this.filterParams = { keyword: '', status: '', fromDate: '', toDate: '' };
    this.applyFilters();
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

  viewDetail(order: any): void {
    this.router.navigate(['/admin/orders', order.id]);
  }

  private updateStatus(order: any, newStatus: string, successMessage: string): void {
    this.orderService.updateBill(order.id, { status: newStatus }).subscribe(() => {
      this.notificationService.show('success', successMessage);
      this.loadOrders();
    });
  }

  canConfirm(order: any): boolean {
    return String(order.status) === '2';
  }

  canCancel(order: any): boolean {
    return ['1', '2', '3', '4'].includes(String(order.status));
  }

  canShip(order: any): boolean {
    return String(order.status) === '3';
  }

  canComplete(order: any): boolean {
    return String(order.status) === '4';
  }

  confirmOrder(order: any): void {
    this.openConfirm({
      title: 'Xác nhận đơn hàng',
      message: `Bạn có chắc chắn muốn xác nhận đơn hàng #${order.id}?`,
      confirmText: 'Xác nhận',
      variant: 'primary',
      action: () => {
        this.updateStatus(order, '3', `Đã xác nhận đơn hàng #${order.id}.`);
      },
    });
  }

  shipOrder(order: any): void {
    this.openConfirm({
      title: 'Xác nhận giao hàng',
      message: `Chuyển đơn hàng #${order.id} sang trạng thái "Đang giao hàng"?`,
      confirmText: 'Xác nhận',
      variant: 'primary',
      action: () => {
        this.updateStatus(order, '4', `Đơn hàng #${order.id} đang được giao.`);
      },
    });
  }

  completeOrder(order: any): void {
    this.openConfirm({
      title: 'Xác nhận hoàn thành',
      message: `Bạn có chắc chắn muốn hoàn thành đơn hàng #${order.id}?`,
      confirmText: 'Hoàn thành',
      variant: 'primary',
      action: () => {
        this.updateStatus(order, '5', `Đã hoàn thành đơn hàng #${order.id}.`);
      },
    });
  }

  cancelOrder(order: any): void {
    this.openConfirm({
      title: 'Xác nhận hủy đơn hàng',
      message: `Bạn có chắc chắn muốn hủy đơn hàng #${order.id}?`,
      confirmText: 'Hủy đơn hàng',
      variant: 'danger',
      action: () => {
        this.updateStatus(order, '6', `Đã hủy đơn hàng #${order.id}.`);
      },
    });
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
