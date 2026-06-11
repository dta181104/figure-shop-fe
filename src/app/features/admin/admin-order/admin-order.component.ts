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
})
export class AdminOrderComponent implements OnInit {
  orders: any[] = [];
  totalOrders = 0;
  pageIndex = 1;
  pageSize = 10;
  isLoading = false;

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
    this.isLoading = true;
    const params = {
      page: this.pageIndex - 1,
      size: this.pageSize,
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
    const labels: { [key: string]: string } = {
      PENDING: 'Chờ xác nhận',
      CONFIRMED: 'Đã xác nhận',
      SHIPPING: 'Đang giao hàng',
      DELIVERED: 'Đã giao',
      CANCELLED: 'Đã hủy',
    };
    return labels[status] || status;
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
}
