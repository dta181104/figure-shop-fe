import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { CategoryService } from '@/app/core/services/category.service';
import { CategoryItem } from '@/app/core/models/category.model';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-admin-category',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, NzTableModule],
  templateUrl: './admin-category.component.html',
  styleUrl: '../admin.component.css',
})
export class AdminCategoryComponent implements OnInit {
  @ViewChild('categoryFormElement') categoryFormElement!: ElementRef;

  private categoryService = inject(CategoryService);

  categories: CategoryItem[] = [];
  isLoading = false;
  isSaving = false;
  editingCategoryCode = '';
  categoryMessage = '';
  categoryError = '';

  categoryForm = {
    code: '',
    name: '',
  };

  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Xác nhận';
  confirmVariant: 'primary' | 'warning' | 'danger' = 'warning';
  private confirmAction: (() => void) | null = null;

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.scrollToTop();
    this.isLoading = true;
    this.categoryService
      .getCategories()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => {
          this.categories = res?.result?.content || res?.result || [];
        },
        error: () => {
          this.categoryError = 'Không thể tải danh sách danh mục.';
        },
      });
  }

  saveCategory(): void {
    if (!this.categoryForm.name.trim()) {
      this.categoryError = 'Vui lòng nhập tên danh mục.';
      return;
    }

    if (this.editingCategoryCode !== '') {
      this.openConfirm({
        title: 'Xác nhận cập nhật',
        message: `Bạn có chắc chắn muốn cập nhật danh mục ${this.categoryForm.name}?`,
        confirmText: 'Cập nhật',
        variant: 'warning',
        action: () => this.proceedSaveCategory(),
      });
    } else {
      this.proceedSaveCategory();
    }
  }

  private proceedSaveCategory(): void {
    this.isSaving = true;
    this.categoryError = '';
    this.categoryMessage = '';
    const isEditing = this.editingCategoryCode !== '';

    const payload: Partial<CategoryItem> = {
      code: this.categoryForm.code.trim() || undefined,
      name: this.categoryForm.name.trim(),
    };

    const request$ = isEditing
      ? this.categoryService.updateCategory(this.editingCategoryCode, {
          ...payload,
          code: this.categoryForm.code.trim() || this.editingCategoryCode,
        })
      : this.categoryService.createCategory(payload);

    request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.categoryMessage = isEditing
          ? 'Cập nhật danh mục thành công.'
          : 'Tạo danh mục thành công.';
        this.resetForm();
        this.loadCategories();
      },
      error: (err) => {
        this.categoryError = err?.error?.message || 'Có lỗi xảy ra.';
      },
    });
  }

  editCategory(category: CategoryItem): void {
    this.scrollToForm();
    this.editingCategoryCode = category.code || '';
    this.categoryForm = {
      code: category.code || '',
      name: category.name || '',
    };
  }

  deleteCategory(category: CategoryItem): void {
    this.openConfirm({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa danh mục ${category.name}?`,
      confirmText: 'Xóa',
      variant: 'danger',
      action: () => {
        if (category.code) {
          this.categoryService.deleteCategory(category.code).subscribe(() => this.loadCategories());
        }
      },
    });
  }

  restoreCategory(category: CategoryItem): void {
    if (!category.code) return;

    this.openConfirm({
      title: 'Xác nhận khôi phục',
      message: `Bạn có chắc chắn muốn khôi phục danh mục ${category.name}?`,
      confirmText: 'Khôi phục',
      variant: 'primary',
      action: () => {
        if (!category.code) return;
        this.categoryService.updateCategory(category.code, { deleted: false } as any).subscribe({
          next: () => {
            this.categoryMessage = 'Khôi phục danh mục thành công.';
            this.loadCategories();
          },
          error: () => {
            this.categoryError = 'Không thể khôi phục danh mục.';
          },
        });
      },
    });
  }

  resetForm(): void {
    this.editingCategoryCode = '';
    this.categoryForm = {
      code: '',
      name: '',
    };
  }

  openConfirm(config: any): void {
    this.confirmTitle = config.title;
    this.confirmMessage = config.message;
    this.confirmText = config.confirmText;
    this.confirmVariant = config.variant;
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
    this.categoryFormElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
