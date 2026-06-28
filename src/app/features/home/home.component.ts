import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Subscription, map } from 'rxjs';
import { ProductItems } from '@/app/core/models/product-item.model';
import { ProductService } from '@/app/core/services/product.service';
import { CategoryService } from '@/app/core/services/category.service';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, NzPaginationModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit, OnDestroy {
  products: ProductItems[] = [];
  getProductApi!: Subscription;
  categories: any[] = [];
  getCategoryApi!: Subscription;
  totalProducts: number = 0;

  params = {
    pageIndex: 1,
    pageSize: 12,
    keyword: '',
    minPrice: null,
    maxPrice: null,
    categoryId: '',
    sortBy: '',
    sortDirection: '',
  };

  router = inject(Router);

  currentYear: number = new Date().getFullYear();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts(false);
  }

  loadCategories() {
    this.getCategoryApi = this.categoryService.getCategories().subscribe({
      next: (res) => {
        this.categories =
          res.result && Array.isArray(res.result.content)
            ? res.result.content
            : Array.isArray(res.result)
              ? res.result
              : [];
      },
      error: (err) => console.error('Load categories failed', err),
    });
  }

  loadProducts(shouldScroll = true) {
    if (shouldScroll) {
      this.scrollToProducts();
    }
    // Clean params before sending
    const queryParams: any = {
      pageIndex: this.params.pageIndex,
      pageSize: this.params.pageSize,
      deleted: false,
    };
    if (this.params.keyword) queryParams.keyword = this.params.keyword;
    if (this.params.minPrice) queryParams.minPrice = this.params.minPrice;
    if (this.params.maxPrice) queryParams.maxPrice = this.params.maxPrice;
    if (this.params.categoryId) queryParams.categoryId = this.params.categoryId;
    if (this.params.sortBy) {
      queryParams.sortBy = this.params.sortBy;
      if (this.params.sortDirection) queryParams.sortDirection = this.params.sortDirection;
    }

    if (this.getProductApi) this.getProductApi.unsubscribe();

    this.getProductApi = this.productService.getProducts(queryParams).subscribe({
      next: (res) => {
        this.totalProducts = res.result?.totalElements || 0;
        const content = res.result?.content || [];
        this.products = content.map((item: any) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          images: item.images,
        }));
      },
      error: (err) => {
        console.error('Load products failed', err);
      },
    });
  }

  applyFilters() {
    // Kiểm tra logic: Giá đến phải lớn hơn hoặc bằng giá từ
    if (
      this.params.minPrice !== null &&
      this.params.maxPrice !== null &&
      this.params.maxPrice < this.params.minPrice
    ) {
      alert('Giá đến phải lớn hơn hoặc bằng giá từ. Vui lòng kiểm tra lại!');
      return;
    }
    this.params.pageIndex = 1;
    this.loadProducts();
  }

  clearFilters() {
    this.params = {
      pageIndex: 1,
      pageSize: 12,
      keyword: '',
      minPrice: null,
      maxPrice: null,
      categoryId: '',
      sortBy: '',
      sortDirection: '',
    };
    this.loadProducts();
  }

  getMainImage(product: ProductItems): string {
    const mainImg = product.images?.find((img) => img.imageMain);
    return mainImg ? mainImg.imageUrl! : 'assets/images/default.png';
  }

  ngOnDestroy(): void {
    if (this.getProductApi) {
      this.getProductApi.unsubscribe();
    }
    if (this.getCategoryApi) {
      this.getCategoryApi.unsubscribe();
    }
  }

  viewDetail(productId: number) {
    this.router.navigate(['/product', productId]);
  }

  private scrollToProducts(): void {
    const element = document.getElementById('products');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
