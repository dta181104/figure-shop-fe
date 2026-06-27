import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { AdminService, AdminUser } from '@/app/core/services/admin.service';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { ConfirmDialogComponent } from '@/app/shared/components/confirm-dialog/confirm-dialog.component';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzTableModule } from 'ng-zorro-antd/table';

@Component({
  selector: 'app-admin-user',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NzPaginationModule,
    ConfirmDialogComponent,
    NzSelectModule,
    NzTableModule,
  ],
  templateUrl: './admin-user.component.html',
  styleUrl: '../admin.component.css',
})
export class AdminUserComponent implements OnInit {
  private adminService = inject(AdminService);

  users: AdminUser[] = [];
  isUsersLoading = false;
  isSavingUser = false;
  userQuery = '';
  editingUserCode = '';
  userMessage = '';
  userError = '';

  // Pagination
  pageIndex = 1;
  pageSize = 10;
  totalUsers = 0;

  // Confirm Dialog
  confirmVisible = false;
  confirmTitle = '';
  confirmMessage = '';
  confirmText = 'Xác nhận';
  confirmVariant: 'primary' | 'warning' | 'danger' = 'warning';
  private confirmAction: (() => void) | null = null;

  userForm = {
    username: '',
    password: '',
    name: '',
    email: '',
    address: '',
    phone: '',
    status: 'ACTIVE',
    role: [] as number[],
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isUsersLoading = true;
    this.adminService
      .getAccounts(this.pageIndex, this.pageSize)
      .pipe(finalize(() => (this.isUsersLoading = false)))
      .subscribe({
        next: (res: any) => {
          this.users = res?.result?.content || [];
          this.totalUsers = res?.result?.totalElements || 0;
        },
        error: (err) => {
          this.userError = 'Không tải được danh sách người dùng.';
        },
      });
  }

  saveUser(): void {
    if (!this.userForm.username.trim()) {
      this.userError = 'Vui lòng nhập username.';
      return;
    }
    if (this.editingUserCode) {
      this.openConfirm({
        title: 'Xác nhận cập nhật',
        message: `Cập nhật tài khoản ${this.userForm.username}?`,
        action: () => this.proceedSaveUser(),
      });
    } else {
      this.proceedCreateUser();
    }
  }

  private proceedSaveUser(): void {
    this.isSavingUser = true;
    const payload = {
      name: this.userForm.name,
      email: this.userForm.email,
      address: this.userForm.address,
      phone: this.userForm.phone,
      status: this.userForm.status,
      roles: this.userForm.role,
    };
    this.adminService
      .updateAccount(this.editingUserCode, payload)
      .pipe(finalize(() => (this.isSavingUser = false)))
      .subscribe({
        next: () => {
          this.userMessage = 'Cập nhật thành công.';
          this.resetUserForm();
          this.loadUsers();
        },
        error: () => (this.userError = 'Cập nhật thất bại.'),
      });
  }

  private proceedCreateUser(): void {
    this.isSavingUser = true;
    this.adminService
      .createAccount({
        username: this.userForm.username,
        pass: this.userForm.password,
        name: this.userForm.name,
        email: this.userForm.email,
        address: this.userForm.address,
        roles: this.userForm.role,
      } as any)
      .pipe(finalize(() => (this.isSavingUser = false)))
      .subscribe({
        next: () => {
          this.userMessage = 'Tạo tài khoản thành công.';
          this.resetUserForm();
          this.loadUsers();
        },
        error: () => (this.userError = 'Tạo tài khoản thất bại.'),
      });
  }

  editUser(user: AdminUser): void {
    this.editingUserCode = user.code || '';
    this.userForm = {
      username: user.username || '',
      password: '',
      name: user.name || user.fullName || '',
      email: user.email || '',
      address: (user as any).address || '',
      phone: user.phone || '',
      status: (user.status?.toString() || 'ACTIVE').toUpperCase(),
      role: this.mapRolesToIds((user as any).roles),
    };
  }

  private mapRolesToIds(roles: any): number[] {
    const rolesArray = Array.isArray(roles) ? roles : roles ? [roles] : [];
    return rolesArray
      .map((r: any) => {
        const val = (typeof r === 'object' ? r.id || r.code || r.name || '' : r)
          .toString()
          .toUpperCase();
        if (val === 'ADMIN' || val === '1') return 1;
        if (val === 'USER' || val === '2') return 2;
        if (val === 'STAFF' || val === '3') return 3;
        return null;
      })
      .filter((v: any) => v !== null) as number[];
  }

  deleteUser(user: AdminUser): void {
    this.openConfirm({
      title: 'Xác nhận xóa',
      message: `Xóa người dùng ${user.username}?`,
      confirmText: 'Xóa',
      variant: 'danger',
      action: () => {
        this.adminService.deleteAccount(user.code!).subscribe(() => this.loadUsers());
      },
    });
  }

  restoreUser(user: AdminUser): void {
    this.adminService.updateAccount(user.code!, {  deleted: false } as any).subscribe({
      next: () => {
        this.userMessage = 'Khôi phục tài khoản thành công.';
        this.loadUsers();
      },
      error: () => (this.userError = 'Khôi phục thất bại.'),
    });
  }

  resetUserForm(): void {
    this.editingUserCode = '';
    this.userForm = {
      username: '',
      password: '',
      name: '',
      email: '',
      address: '',
      phone: '',
      status: 'ACTIVE',
      role: [],
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
}
