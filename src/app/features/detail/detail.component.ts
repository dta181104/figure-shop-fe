import {
  Component,
  OnInit,
  inject,
  DestroyRef,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class DetailComponent implements OnInit {
  product?: ProductItems;
  suggestedProducts: ProductItems[] = [];
  isSuggestionLoading = false;
  private destroyRef = inject(DestroyRef);
  selectedImageUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private cartService: CartService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  public modelUrl: string | undefined;

  @ViewChild('viewer', { static: false }) viewerRef!: ElementRef;

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
        this.modelUrl = this.product?.images?.find((img) => !img.imageMain)?.imageUrl;
        this.selectedImageUrl = null;
        this.loadSuggestedProducts();
      });
  }

  private loadSuggestedProducts(): void {
    const categoryId = this.product?.categoryId;
    if (!categoryId) {
      this.suggestedProducts = [];
      return;
    }

    this.isSuggestionLoading = true;
    this.productService
      .getProducts({
        pageIndex: 0,
        pageSize: 5,
        categoryId,
        deleted: false,
      } as any)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          const content = res.result?.content || [];
          const currentId = this.product?.id;
          this.suggestedProducts = content.filter((item) => item.id !== currentId).slice(0, 5);
          this.isSuggestionLoading = false;
        },
        error: () => {
          this.suggestedProducts = [];
          this.isSuggestionLoading = false;
        },
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

  viewDetail(productId: number): void {
    this.router.navigate(['/product', productId]);
  }

  getSuggestionImage(product: ProductItems): string {
    return product.images?.find((img) => img.imageMain)?.imageUrl ?? 'assets/images/default.png';
  }

  trackSuggestionById(index: number, item: ProductItems): number {
    return item.id;
  }
}
