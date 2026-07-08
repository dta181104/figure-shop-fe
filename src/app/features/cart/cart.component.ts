import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductItems } from '@/app/core/models/product-item.model';
import { Router, RouterModule } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CartService } from '@/app/core/services/cart.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { ProductService } from '@/app/core/services/product.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent {
  cartItems: (ProductItems & { selected?: boolean })[] = [];
  selectedTotal = 0;
  isIncreasing: { [key: number]: boolean } = {};

  constructor(
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService,
    private productService: ProductService
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe((cart) => {
      this.cartItems = cart;
      this.updateSelectedItems();
    });
  }

  increase(item: ProductItems): void {
    if (this.isIncreasing[item.id]) return;

    this.isIncreasing[item.id] = true;
    this.productService.getProductById(item.id.toString()).subscribe({
      next: (res) => {
        const productDetail = res.result;
        const stockQuantity = productDetail.quantity; // Số lượng tồn kho từ API
        if (stockQuantity !== undefined) {
          this.cartService.increaseQuantity(item, stockQuantity);
        } else {
          this.notificationService.show('error', 'Không thể xác định số lượng tồn kho.');
        }
        this.isIncreasing[item.id] = false;
      },
      error: () => {
        this.notificationService.show('error', 'Lỗi khi kiểm tra số lượng sản phẩm.');
        this.isIncreasing[item.id] = false;
      },
    });
  }

  decrease(item: ProductItems) {
    this.cartService.decreaseQuantity(item);
  }

  remove(id: number) {
    this.cartService.removeItem(id);
  }

  clearCart() {
    this.cartService.clearCart();
  }

  updateSelectedItems() {
    this.selectedTotal = this.cartItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + item.price * (item.quantity || 1), 0);
  }

  hasSelected() {
    return this.cartItems.some((item) => item.selected);
  }

  checkout() {
    const selectedItems = this.cartItems.filter((item) => item.selected);
    if (!selectedItems.length) {
      this.notificationService.show('warning', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }

    this.router.navigate(['/checkout'], {
      state: { items: selectedItems },
    });
  }
}
