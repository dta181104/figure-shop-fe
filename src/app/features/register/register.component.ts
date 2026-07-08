import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@/app/core/services/notification.service';

interface RegisterRequest {
  username: string;
  email: string;
  pass: string;
  name: string;
  roles: string[] | null;
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
})
export class RegisterComponent {
  user: RegisterRequest = {
    username: '',
    email: '',
    pass: '',
    name: '',
    roles: null,
  };
  avatarFile: File | null = null;
  errorMessage = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  onFileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files?.length) {
      this.avatarFile = target.files[0];
    }
  }

  onRegister() {
    if (!this.user.username || !this.user.email || !this.user.pass || !this.user.name) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin!';
      return;
    }

    const formData = new FormData();
    Object.entries(this.user).forEach(([key, value]) => {
      if (value !== null) {
        formData.append(key, value as any);
      }
    });
    if (this.avatarFile) {
      formData.append('avatarFile', this.avatarFile);
    }

    this.http.post(`users/register`, formData).subscribe({
      next: () => {
        this.notificationService.show('success', 'Đăng ký thành công!');
        this.errorMessage = '';
        this.router.navigate(['/login']);
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = err?.error?.message || 'Đăng ký thất bại, vui lòng thử lại!';
      },
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
