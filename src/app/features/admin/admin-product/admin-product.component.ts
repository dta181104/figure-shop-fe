import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ProductService } from '@/app/core/services/product.service';
import { CategoryService } from '@/app/core/services/category.service';
import { ProductItems } from '@/app/core/models/product-item.model';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-admin-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, NzTableModule],
  templateUrl: './admin-product.component.html',
  styleUrl: '../admin.component.css',
})
export class AdminProductComponent implements OnInit {
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);

  products: ProductItems[] = [];
  categories: any[] = [];
  isProductsLoading = false;
  isSavingProduct = false;
  editingProductCode = '';
  productMessage = '';
  productError = '';
  priceError = '';

  // Filters
  filterParams = {
    keyword: '',
    categoryId: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sortBy: '',
    sortDirection: 'ASC',
  };

  // Tham số thực tế được dùng để gọi API, chỉ cập nhật khi nhấn nút "Tìm kiếm"
  appliedFilterParams = {
    keyword: '',
    categoryId: '',
    minPrice: null as number | null,
    maxPrice: null as number | null,
    sortBy: '',
    sortDirection: 'ASC',
  };

  // Pagination
  pageIndex = 1;
  pageSize = 10;
  totalProducts = 0;

  // Confirm Dialog
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Xác nhận';
  confirmVariant: 'primary' | 'warning' | 'danger' = 'warning';
  private confirmAction: (() => void) | null = null;

  productForm = {
    code: '',
    name: '',
    description: '',
    price: null as number | null,
    quantity: null as number | null,
    status: 1,
    categoryId: null as number | null,
  };

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe((res) => {
      this.categories = res.result?.content || res.result || [];
    });
  }

  loadProducts(): void {
    this.scrollToTop();
    this.isProductsLoading = true;
    const query = {
      pageIndex: this.pageIndex,
      pageSize: this.pageSize,
      keyword: this.appliedFilterParams.keyword,
      categoryId: this.appliedFilterParams.categoryId,
      minPrice: this.appliedFilterParams.minPrice,
      maxPrice: this.appliedFilterParams.maxPrice,
      sortBy: this.appliedFilterParams.sortBy,
      sortDirection: this.appliedFilterParams.sortDirection,
    };
    this.productService
      .getProducts(query)
      .pipe(finalize(() => (this.isProductsLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.products = res?.result?.content || [];
          this.totalProducts = res?.result?.totalElements || 0;
        },
        error: () => (this.productError = 'Không tải được sản phẩm.'),
      });
  }

  applyFilters(): void {
    // Kiểm tra logic: Giá đến phải lớn hơn hoặc bằng giá từ
    if (
      this.filterParams.minPrice !== null &&
      this.filterParams.maxPrice !== null &&
      this.filterParams.maxPrice < this.filterParams.minPrice
    ) {
      this.priceError = 'Giá đến phải lớn hơn hoặc bằng giá từ';
      return;
    }
    this.priceError = '';
    this.appliedFilterParams = { ...this.filterParams };
    this.pageIndex = 1;
    this.loadProducts();
  }

  clearFilters(): void {
    this.priceError = '';
    this.filterParams = {
      keyword: '',
      categoryId: '',
      minPrice: null,
      maxPrice: null,
      sortBy: '',
      sortDirection: 'ASC',
    };
    this.appliedFilterParams = { ...this.filterParams };
    this.loadProducts();
  }

  saveProduct(): void {
    if (!this.productForm.name.trim() || this.productForm.price === null) {
      this.productError = 'Vui lòng nhập tên và giá sản phẩm.';
      return;
    }

    if (this.editingProductCode) {
      this.openConfirm({
        title: 'Xác nhận cập nhật sản phẩm',
        message: `Bạn có chắc chắn muốn cập nhật sản phẩm ${this.productForm.name}?`,
        confirmText: 'Cập nhật',
        variant: 'warning',
        action: () => this.proceedSaveProduct(),
      });
      return;
    }

    this.proceedCreateProduct();
  }

  private proceedSaveProduct(): void {
    this.productError = '';
    this.productMessage = '';
    this.isSavingProduct = true;

    const payload: Partial<ProductItems> = {
      code: this.productForm.code.trim() || undefined,
      name: this.productForm.name.trim(),
      description: this.productForm.description.trim() || undefined,
      price: Number(this.productForm.price),
      quantity: this.productForm.quantity !== null ? Number(this.productForm.quantity) : undefined,
      status: Number(this.productForm.status),
      categoryId: this.productForm.categoryId || undefined,
    };

    this.productService
      .updateProduct(this.editingProductCode, payload)
      .pipe(finalize(() => (this.isSavingProduct = false)))
      .subscribe({
        next: () => {
          this.productMessage = 'Cập nhật sản phẩm thành công.';
          this.resetProductForm();
          this.loadProducts();
        },
        error: (err: any) => {
          this.productError = err?.error?.message || 'Không thể cập nhật sản phẩm.';
        },
      });
  }

  private proceedCreateProduct(): void {
    this.productError = '';
    this.productMessage = '';
    this.isSavingProduct = true;

    const payload: Partial<ProductItems> = {
      code: this.productForm.code.trim() || undefined,
      name: this.productForm.name.trim(),
      description: this.productForm.description.trim() || undefined,
      price: Number(this.productForm.price),
      quantity: this.productForm.quantity !== null ? Number(this.productForm.quantity) : undefined,
      status: Number(this.productForm.status),
      categoryId: this.productForm.categoryId || undefined,
    };

    this.productService
      .createProduct(payload)
      .pipe(finalize(() => (this.isSavingProduct = false)))
      .subscribe({
        next: () => {
          this.productMessage = 'Tạo sản phẩm thành công.';
          this.resetProductForm();
          this.loadProducts();
        },
        error: (err: any) => {
          this.productError = err?.error?.message || 'Không thể tạo sản phẩm.';
        },
      });
  }

  editProduct(product: ProductItems): void {
    this.scrollToTop();
    this.editingProductCode = product.code || '';
    this.productForm = {
      code: product.code || '',
      name: product.name || '',
      description: product.description || '',
      price: product.price || null,
      quantity: product.quantity || null,
      status: product.status || 1,
      categoryId: (product as any).category?.id || (product as any).categoryId || null,
    };
  }

  deleteProduct(product: ProductItems): void {
    this.openConfirm({
      title: 'Xác nhận xóa',
      message: `Xóa sản phẩm ${product.name}?`,
      confirmText: 'Xóa',
      variant: 'danger',
      action: () => {
        this.productService.deleteProduct(product.code!).subscribe(() => this.loadProducts());
      },
    });
  }

  restoreProduct(product: ProductItems): void {
    this.openConfirm({
      title: 'Xác nhận khôi phục',
      message: `Bạn có chắc chắn muốn khôi phục sản phẩm ${product.name}?`,
      confirmText: 'Khôi phục',
      variant: 'primary',
      action: () => {
        // Giả sử API update hỗ trợ chuyển trạng thái deleted hoặc có endpoint riêng
        this.productService.updateProduct(product.code!, { deleted: false } as any).subscribe({
          next: () => this.loadProducts(),
          error: (err) => (this.productError = 'Không thể khôi phục sản phẩm.'),
        });
      },
    });
  }

  resetProductForm(): void {
    this.editingProductCode = '';
    this.productForm = {
      code: '',
      name: '',
      description: '',
      price: null,
      quantity: null,
      status: 1,
      categoryId: null as number | null,
    };
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

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
