import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { OrderService } from '../../core/services/order.service';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzTableModule,
    NzTagModule,
    NzButtonModule,
    NzInputModule,
    NzSelectModule,
  ],
  styles: [
    `
      .order-history-container {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
        min-height: 70vh;
      }
      .page-title {
        font-size: 24px;
        font-weight: 600;
        margin-bottom: 20px;
      }
      .filter-section {
        margin-bottom: 20px;
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
      }
    `,
  ],
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);

  orders: any[] = [];
  totalOrders = 0;
  pageIndex = 1;
  pageSize = 10;
  isLoading = false;

  filterParams = {
    status: '',
  };

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    const params = {
      page: this.pageIndex - 1,
      size: this.pageSize,
      status: this.filterParams.status,
    };

    this.orderService.getAll(params).subscribe({
      next: (res: any) => {
        // Kiểm tra nếu API trả về List trực tiếp thay vì đối tượng Page (phù hợp với BillController hiện tại)
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
      },
    });
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

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      PENDING: 'warning',
      CONFIRMED: 'blue',
      SHIPPING: 'processing',
      DELIVERED: 'success',
      CANCELLED: 'error',
    };
    return colors[status] || 'default';
  }

  viewDetail(order: any): void {
    console.log('Xem chi tiết đơn hàng:', order.id);
    // Thêm logic điều hướng đến trang chi tiết hoặc mở modal ở đây
  }
}
