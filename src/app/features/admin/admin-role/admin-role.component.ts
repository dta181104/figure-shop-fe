import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '@/app/core/services/role.service';
import { finalize } from 'rxjs';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';
import { NzTableModule } from 'ng-zorro-antd/table';
import { PermissionService } from '@/app/core/services/permission.service';
import { NzSelectModule } from 'ng-zorro-antd/select';

@Component({
  selector: 'app-admin-role',
  standalone: true,
  imports: [CommonModule, FormsModule, ConfirmDialogComponent, NzTableModule, NzSelectModule],
  templateUrl: './admin-role.component.html',
  styleUrl: '../admin.component.css',
})
export class AdminRoleComponent implements OnInit {
  @ViewChild('roleFormElement') roleFormElement!: ElementRef;

  private roleService = inject(RoleService);
  private permissionService = inject(PermissionService);

  roles: any[] = [];
  allPermissions: any[] = [];
  isLoading = false;
  isSaving = false;
  editingRoleId: number | null = null;
  errorMessage = '';

  roleForm = {
    code: '',
    name: '',
    permissions: [] as number[],
  };

  // Confirm Dialog state
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Xác nhận';
  confirmVariant: 'primary' | 'warning' | 'danger' = 'warning';
  private confirmAction: (() => void) | null = null;

  ngOnInit(): void {
    this.loadRoles();
    this.loadPermissions();
  }

  loadRoles(): void {
    this.scrollToTop();
    this.isLoading = true;
    this.roleService
      .getRoles()
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (res) => (this.roles = res.result || []),
        error: () => (this.errorMessage = 'Không thể tải danh sách vai trò.'),
      });
  }

  loadPermissions(): void {
    this.permissionService.getPermissions().subscribe({
      next: (res) => (this.allPermissions = res.result || []),

      error: () => (this.errorMessage = 'Không thể tải danh sách quyền.'),
    });
  }

  saveRole(): void {
    if (!this.roleForm.name) return;

    if (this.editingRoleId != null) {
      this.openConfirm({
        title: 'Xác nhận cập nhật',
        message: `Bạn có chắc chắn muốn cập nhật vai trò ${this.roleForm.name}?`,
        confirmText: 'Cập nhật',
        variant: 'warning',
        action: () => this.proceedSaveRole(),
      });
    } else {
      this.proceedSaveRole();
    }
  }

  private proceedSaveRole(): void {
    this.isSaving = true;
    const isEditing = this.editingRoleId != null;

    const payload = {
      name: this.roleForm.name,
      code: this.roleForm.code,
      permissions: this.roleForm.permissions.map(Number).filter((id) => !isNaN(id) && id > 0),
    };

    const request$ = isEditing
      ? this.roleService.updateRole(String(this.editingRoleId), {
          ...payload,
          id: this.editingRoleId,
        })
      : this.roleService.createRole(payload);

    request$.pipe(finalize(() => (this.isSaving = false))).subscribe({
      next: () => {
        this.resetForm();
        this.loadRoles();
      },
      error: (err) => (this.errorMessage = err?.error?.message || 'Có lỗi xảy ra.'),
    });
  }

  editRole(role: any): void {
    this.scrollToForm();
    // Đảm bảo lấy ID từ role. Nếu API trả về trường khác (như code), hãy kiểm tra lại
    this.editingRoleId = role.id ?? null;
    this.roleForm = {
      code: role.code,
      name: role.name,
      permissions:
        role.permissions
          ?.map((p: any) => {
            const id = typeof p === 'object' ? p?.id : p;
            return id ? Number(id) : null;
          })
          .filter((id: any) => id !== null && !isNaN(id)) || [],
    };
  }

  deleteRole(role: any): void {
    this.openConfirm({
      title: 'Xác nhận xóa',
      message: `Bạn có chắc chắn muốn xóa vai trò ${role.name}?`,
      confirmText: 'Xóa',
      variant: 'danger',
      action: () => {
        if (role.id) {
          this.roleService.deleteRole(role.id).subscribe(() => this.loadRoles());
        }
      },
    });
  }

  restoreRole(role: any): void {
    this.openConfirm({
      title: 'Xác nhận khôi phục',
      message: `Bạn có chắc chắn muốn khôi phục vai trò ${role.name}?`,
      confirmText: 'Khôi phục',
      variant: 'primary',
      action: () => {
        if (role.id) {
          this.roleService
            .updateRole(String(role.id), { ...role, deleted: false })
            .subscribe(() => this.loadRoles());
        }
      },
    });
  }

  resetForm(): void {
    this.editingRoleId = null;
    this.roleForm = { code: '', name: '', permissions: [] };
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
    this.roleFormElement.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
