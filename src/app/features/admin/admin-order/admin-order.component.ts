import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { OrderService } from '../../../core/services/order.service';

@Component({
  selector: 'app-admin-order',
  templateUrl: './admin-order.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, NzTableModule],
  styleUrls: ['../admin.component.css', './admin-order.component.css'],
})
export class AdminOrderComponent implements OnInit {
  orders: any[] = [];
  totalOrders = 0;
  pageIndex = 1;
  pageSize = 10;
  isLoading = false;

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

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.scrollToTop();
    this.isLoading = true;
    const params = {
      pageIndex: this.pageIndex - 1,
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
    // Logic mở modal hoặc chuyển hướng trang chi tiết
    console.log('Xem chi tiết đơn:', order.code);
  }

  updateStatus(order: any, newStatus: string): void {
    this.orderService.updateBill(order.id, { status: newStatus }).subscribe(() => {
      // Cập nhật lại danh sách sau khi đổi trạng thái thành công
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
    this.updateStatus(order, '3');
  }

  shipOrder(order: any): void {
    this.updateStatus(order, '4');
  }

  completeOrder(order: any): void {
    this.updateStatus(order, '5');
  }

  cancelOrder(order: any): void {
    this.updateStatus(order, '6');
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
