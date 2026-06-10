import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductItems } from '@/app/core/models/product-item.model';
import { ProductService } from '@/app/core/services/product.service';
import { CartService } from '@/app/core/services/cart.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationService } from '@/app/core/services/notification.service';

@Component({
  selector: 'app-detail',
  standalone: true,
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css'],
  imports: [CommonModule],
})
export class DetailComponent implements OnInit {
  product?: ProductItems;
  private destroyRef = inject(DestroyRef);
  selectedImageUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Lắng nghe thay đổi param id
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.loadProduct(id);
      }
    });
  }

  private loadProduct(id: string): void {
    this.productService
      .getProductById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((res) => {
        this.product = res.result;
      });
  }

  getMainImage(): string {
    const mainImg = this.product?.images?.find((img) => img.imageMain);
    return mainImg?.imageUrl ?? 'assets/images/default.png';
  }

  onThumbnailClick(url: string | undefined) {
    if (url) {
      this.selectedImageUrl = url;
    }
  }

  get hasMultipleImages(): boolean {
    return (this.product?.images?.length ?? 0) > 1;
  }

  addToCart(): void {
    if (!this.product) return;
    this.cartService.addToCart(this.product);
    // alert('Đã thêm sản phẩm vào giỏ hàng!');
    this.notificationService.show('success', 'Thêm giỏ hàng thành công!');
  }
}
