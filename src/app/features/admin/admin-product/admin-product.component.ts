import {
  Component,
  OnInit,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
  ViewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { ProductService } from '@/app/core/services/product.service';
import { CategoryService } from '@/app/core/services/category.service';
import { NotificationService } from '@/app/core/services/notification.service';
import { ProductItems } from '@/app/core/models/product-item.model';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-admin-product',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, NzTableModule],
  templateUrl: './admin-product.component.html',
  styleUrls: ['../admin.component.css', './admin-product.component.css'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdminProductComponent implements OnInit {
  @ViewChild('productFormElement') productFormElement!: ElementRef;
  @ViewChild('mainImageInput') mainImageInput!: ElementRef<HTMLInputElement>;
  @ViewChild('modelInput') modelInput!: ElementRef<HTMLInputElement>;

  private readonly maxUploadSize = 10 * 1024 * 1024; // 10MB
  private productService = inject(ProductService);
  private categoryService = inject(CategoryService);
  private notificationService = inject(NotificationService);

  products: ProductItems[] = [];
  categories: any[] = [];
  isProductsLoading = false;
  isSavingProduct = false;
  editingProductCode = '';
  productMessage = '';
  productError = '';
  priceError = '';
  imageError = '';
  mainImageFileName = '';
  modelFileName = '';
  mainImagePreviewUrl: string | null = null;
  modelPreviewUrl: string | null = null;

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

  mainImageFile: File | null = null;
  modelFile: File | null = null;

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
    if (
      this.filterParams.minPrice !== null &&
      this.filterParams.maxPrice !== null &&
      this.filterParams.maxPrice < this.filterParams.minPrice
    ) {
      this.priceError = 'Giá đến phải lớn hơn hoặc bằng giá từ';
      this.notificationService.show('warning', 'Giá đến phải lớn hơn hoặc bằng giá từ');
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

    if (this.imageError) {
      this.productError = this.imageError;
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

    const payload = this.buildProductFormData({
      code: this.productForm.code.trim() || undefined,
      name: this.productForm.name.trim(),
      description: this.productForm.description.trim() || undefined,
      price: Number(this.productForm.price),
      quantity: this.productForm.quantity !== null ? Number(this.productForm.quantity) : undefined,
      status: Number(this.productForm.status),
      categoryId: this.productForm.categoryId || undefined,
    });

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

    const payload = this.buildProductFormData({
      code: this.productForm.code.trim() || undefined,
      name: this.productForm.name.trim(),
      description: this.productForm.description.trim() || undefined,
      price: Number(this.productForm.price),
      quantity: this.productForm.quantity !== null ? Number(this.productForm.quantity) : undefined,
      status: Number(this.productForm.status),
      categoryId: this.productForm.categoryId || undefined,
    });

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
    this.productMessage = '';
    if (!product.code) return;

    this.scrollToForm();
    this.resetProductForm();
    this.editingProductCode = product.code || '';
    // this.isSavingProduct = true; // Tận dụng cờ loading có sẵn

    this.productService
      .getProductById(product.id.toString())
      // .pipe(finalize(() => (this.isSavingProduct = false)))
      .subscribe({
        next: (res) => {
          const detailedProduct = res.result;
          this.productForm = {
            code: detailedProduct.code || '',
            name: detailedProduct.name || '',
            description: detailedProduct.description || '',
            price: detailedProduct.price ?? null,
            quantity: detailedProduct.quantity ?? null,
            status: detailedProduct.status ?? 1,
            categoryId: detailedProduct.categoryId ?? null,
          };
          const mainImage = detailedProduct.images?.find((img) => img.imageMain);
          if (mainImage?.imageUrl) {
            this.mainImagePreviewUrl = mainImage.imageUrl;
            this.mainImageFileName = mainImage.imageUrl.split('/').pop() || '';
          } else {
            this.mainImagePreviewUrl = null;
            this.mainImageFileName = '';
          }
          const modelImage = detailedProduct.images?.find((img) => !img.imageMain);
          if (modelImage?.imageUrl) {
            this.modelPreviewUrl = modelImage.imageUrl;
            this.modelFileName = modelImage.imageUrl.split('/').pop() || '';
          } else {
            this.modelPreviewUrl = null;
            this.modelFileName = '';
          }
        },
        error: () => this.notificationService.show('error', 'Không thể tải chi tiết sản phẩm.'),
      });
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
        this.productService.updateProduct(product.code!, { deleted: false } as any).subscribe({
          next: () => this.loadProducts(),
          error: (err) => (this.productError = 'Không thể khôi phục sản phẩm.'),
        });
      },
    });
  }

  resetProductForm(): void {
    this.editingProductCode = '';
    this.imageError = '';
    this.mainImageInput.nativeElement.value = '';
    this.modelInput.nativeElement.value = '';
    this.mainImageFileName = '';
    this.modelFileName = '';
    this.mainImagePreviewUrl = null;
    this.modelPreviewUrl = null;
    this.mainImageFile = null;
    this.modelFile = null;
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

  onMainImageSelected(event: Event): void {
    this.imageError = '';
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;

    if (!file) {
      this.mainImageFile = null;
      this.mainImageFileName = '';
      this.mainImagePreviewUrl = null;
      return;
    }

    const error = this.validateImageFile(file);
    if (error) {
      this.imageError = error;
      target.value = '';
      return;
    }

    this.mainImageFile = file;
    this.mainImageFileName = file.name;
    this.mainImagePreviewUrl = URL.createObjectURL(file);
  }

  onModelFileSelected(event: Event): void {
    this.imageError = '';
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0] ?? null;

    if (!file) {
      this.modelFile = null;
      this.modelFileName = '';
      this.modelPreviewUrl = null;
      return;
    }

    const error = this.validateGlbFile(file);
    if (error) {
      this.imageError = error;
      target.value = '';
      return;
    }

    this.modelFile = file;
    this.modelFileName = file.name;
    this.modelPreviewUrl = URL.createObjectURL(file);
  }

  private validateImageFile(file: File): string | null {
    if (file.size > this.maxUploadSize) {
      return `File ảnh chính phải nhỏ hơn hoặc bằng 10MB.`;
    }

    if (!file.type.startsWith('image/')) {
      return 'Ảnh chính chỉ chấp nhận file ảnh 2D.';
    }

    return null;
  }

  private validateGlbFile(file: File): string | null {
    if (file.size > this.maxUploadSize) {
      return 'File GLB phải nhỏ hơn hoặc bằng 10MB.';
    }

    const fileName = file.name.toLowerCase();
    const isGlbByName = fileName.endsWith('.glb');
    const isGlbByType = file.type === 'model/gltf-binary';

    if (!isGlbByName && !isGlbByType) {
      return 'File mô hình chỉ chấp nhận định dạng .glb.';
    }

    return null;
  }

  private buildProductFormData(baseFields: Record<string, any>): FormData {
    const formData = new FormData();

    Object.entries(baseFields).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, String(value));
      }
    });

    const images: Array<{ file: File; mainImage: boolean }> = [];
    if (this.mainImageFile) {
      images.push({ file: this.mainImageFile, mainImage: true });
    }
    if (this.modelFile) {
      images.push({ file: this.modelFile, mainImage: false });
    }

    images.forEach((image, index) => {
      formData.append(`images[${index}].imageFile`, image.file);
      formData.append(`images[${index}].mainImage`, String(image.mainImage));
    });

    return formData;
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

  private scrollToForm(): void {
    this.productFormElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
