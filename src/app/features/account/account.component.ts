import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../core/services/user.service';

type UserProfile = {
  code?: string;
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  avatarUrl?: string;
  roles?: Array<{ code?: string; name?: string }>;
  createdDate?: string;
  createdAt?: string;
};

type ApiResponse<T> = {
  code?: number;
  message?: string;
  result?: T;
};

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css'],
})
export class AccountComponent implements OnInit {
  isBrowser = false;
  profile: UserProfile | null = null;
  isAdmin = false;
  isLoading = false;
  apiError = '';

  isEditing = false;
  isUpdating = false;
  updateSuccess = '';
  updateForm!: FormGroup;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private userService: UserService,
    private fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.isBrowser = isPlatformBrowser(this.platformId);

    if (!this.isBrowser) {
      return;
    }

    this.initForm();
    this.loadProfile();
    this.loadMyInfo();
  }

  private initForm(): void {
    this.updateForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
    });
  }

  get displayName(): string {
    return this.profile?.name || this.profile?.username || 'Người dùng';
  }

  get email(): string {
    return this.profile?.email || 'Chưa cập nhật email';
  }

  get phone(): string {
    return this.profile?.phone || 'Chưa cập nhật số điện thoại';
  }

  get createdAt(): string {
    return this.profile?.createdDate || this.profile?.createdAt || 'Không xác định';
  }

  get avatarLabel(): string {
    const source = this.displayName.trim() || 'User';
    return source
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('');
  }

  private loadProfile(): void {
    try {
      const raw = localStorage.getItem('user_profile');
      if (!raw) {
        this.profile = null;
        this.isAdmin = false;
        return;
      }

      const parsed = JSON.parse(raw);
      this.profile = parsed?.result ?? parsed?.user ?? parsed;

      const roles = this.profile?.roles ?? [];
      this.isAdmin = this.hasAdminRole(roles);
    } catch {
      this.profile = null;
      this.isAdmin = false;
    }
  }

  private loadMyInfo(): void {
    this.isLoading = true;
    this.apiError = '';

    this.userService.getMyInfo().subscribe({
      next: (res) => {
        const payload = res?.result;
        if (!payload) {
          this.isLoading = false;
          return;
        }

        this.profile = {
          ...this.profile,
          ...payload,
        };

        this.isAdmin = this.hasAdminRole(this.profile?.roles || []);
        
        // Update local storage to keep data consistent
        localStorage.setItem('user_profile', JSON.stringify(this.profile));
        
        this.isLoading = false;
      },
      error: () => {
        this.apiError = 'Không tải được thông tin tài khoản từ server. Đang dùng dữ liệu cục bộ.';
        this.isLoading = false;
      },
    });
  }

  private hasAdminRole(roles: Array<{ code?: string; name?: string }> | undefined | null): boolean {
    return (
      Array.isArray(roles) &&
      roles.some((role) => {
        const code = (role?.code || role?.name || '').toString().toUpperCase();
        return code === 'ADMIN' || code.includes('ADMIN');
      })
    );
  }

  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    this.updateSuccess = '';
    this.apiError = '';
    
    if (this.isEditing && this.profile) {
      this.updateForm.patchValue({
        name: this.profile.name || this.profile.username || '',
        email: this.profile.email || '',
        phone: this.profile.phone || '',
      });
    }
  }

  onSubmitUpdate(): void {
    if (this.updateForm.invalid || !this.profile?.code) {
      if (!this.profile?.code) {
        this.apiError = 'Không thể cập nhật: Thiếu thông tin ID người dùng.';
      }
      return;
    }

    this.isUpdating = true;
    this.apiError = '';
    this.updateSuccess = '';

    const payload = this.updateForm.value;

    this.userService.updateUser(this.profile.code, payload).subscribe({
      next: (res) => {
        this.isUpdating = false;
        this.isEditing = false;
        this.updateSuccess = 'Cập nhật thông tin thành công!';
        
        if (res.result) {
           this.profile = {
             ...this.profile,
             ...res.result
           };
        } else {
           this.profile = {
             ...this.profile,
             ...payload
           };
        }

        localStorage.setItem('user_profile', JSON.stringify(this.profile));
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          this.updateSuccess = '';
        }, 3000);
      },
      error: (err) => {
        this.isUpdating = false;
        this.apiError = err?.error?.message || 'Có lỗi xảy ra khi cập nhật thông tin.';
      }
    });
  }
}
