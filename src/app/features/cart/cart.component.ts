import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProductItems } from '@/app/core/models/product-item.model';
import { Router, RouterModule } from '@angular/router';
import { RouterLink } from '@angular/router';
import { CartService } from '@/app/core/services/cart.service';
import { NotificationService } from '@/app/core/services/notification.service';

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

  constructor(
    private cartService: CartService,
    private router: Router,
    private notificationService: NotificationService
  ) {}

  ngOnInit() {
    this.cartService.cart$.subscribe((cart) => {
      this.cartItems = cart;
      this.updateSelectedItems();
    });
  }

  increase(item: ProductItems) {
    this.cartService.increaseQuantity(item);
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
      // alert('Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      this.notificationService.show('warning', 'Vui lòng chọn ít nhất một sản phẩm để thanh toán!');
      return;
    }

    this.router.navigate(['/checkout'], {
      state: { items: selectedItems },
    });
  }
}
