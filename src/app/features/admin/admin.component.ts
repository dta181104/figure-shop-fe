import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { AdminService, AdminUser } from '@/app/core/services/admin.service';
import { ProductService } from '@/app/core/services/product.service';
import { ProductItems } from '@/app/core/models/product-item.model';
import { CategoryService } from '@/app/core/services/category.service';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { AdminUserComponent } from './admin-user/admin-user.component';
import { AdminProductComponent } from './admin-product/admin-product.component';
import { AdminRoleComponent } from './admin-role/admin-role.component';

type TabKey = 'users' | 'products' | 'roles';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    AdminUserComponent,
    AdminProductComponent,
    AdminRoleComponent,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
  activeTab: TabKey = 'users';

  isBrowser = false;
  isAdmin = false;
  forbiddenMessage = '';

  private route = inject(ActivatedRoute);
  private adminService = inject(AdminService);

  constructor(@Inject(PLATFORM_ID) private platformId: object) {}

  ngOnInit(): void {
    const routeTab = this.route.snapshot.data['tab'];
    if (routeTab === 'users' || routeTab === 'products' || routeTab === 'roles') {
      this.activeTab = routeTab;
    }
    this.isBrowser = isPlatformBrowser(this.platformId);
    if (!this.isBrowser) {
      this.forbiddenMessage = 'Không thể truy cập khu vực quản trị ơ môi trường hiện tại.';
      return;
    }

    const token = localStorage.getItem('access_token');
    if (!token) {
      this.forbiddenMessage = 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.';
      return;
    }

    this.adminService.getMyInfo().subscribe({
      next: (res) => {
        const profile = res?.result ?? {};
        const roles = profile?.roles ?? [];
        this.isAdmin = this.hasAdminRole(roles);

        if (!this.isAdmin) {
          this.forbiddenMessage = 'Tài khoản hiện tại không có quyền quản trị.';
          return;
        }

        localStorage.setItem('user_profile', JSON.stringify(profile));
      },
      error: (err: any) => {
        const status = err?.status || 'unknown';
        this.forbiddenMessage = `[${status}] Không xác thực được qUyền quản trị. Vui lòng đăng nhập lại.`;
      },
    });
  }

  setTab(tab: TabKey): void {
    this.activeTab = tab;
  }

  private hasAdminRole(roles: any[] | undefined | null): boolean {
    return (
      Array.isArray(roles) &&
      roles.some((role) => {
        const code = (
          typeof role === 'string' ? role : (role as any)?.code || (role as any)?.name || ''
        )
          .toString()
          .toUpperCase();
        return code === 'ADMIN' || code.includes('ADMIN');
      })
    );
  }
}
