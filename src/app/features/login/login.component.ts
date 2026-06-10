import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NotificationService } from '@/app/core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  user = {
    username: '',
    pass: '',
  };

  errorMessage = '';
  rememberMe = false;

  // Quên mật khẩu
  showForgotPasswordModal = false;
  showOtpModal = false;
  showResetPasswordModal = false;
  isSending = false;

  forgotEmail = '';
  forgotUsername = '';
  forgotMessage = '';
  otpCode = '';
  otpMessage = '';
  newPassword = '';
  resetMessage = '';

  private http = inject(HttpClient);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  private saveProfileAndRedirect(): void {
    this.http.get('users/myInfo').subscribe({
      next: (profileRes: any) => {
        const profile = profileRes?.result ?? profileRes;
        localStorage.setItem('user_profile', JSON.stringify(profile));
        this.notificationService.show('success', 'Đăng nhập thành công!');
        this.router.navigateByUrl('/');
      },
      error: () => {
        this.notificationService.show('success', 'Đăng nhập thành công!');
        this.router.navigateByUrl('/');
      },
    });
  }

  // Đăng nhập
  onLogin() {
    this.errorMessage = '';

    // Xoá token cũ để tránh interceptor gửi nhầm token hết hạn
    localStorage.removeItem('access_token');

    if (!this.user.username || !this.user.pass) {
      this.errorMessage = 'Vui lòng nhập đầy đủ tên người dùng và mật khẩu.';
      return;
    }

    this.http
      .post(`auth/token`, this.user, {
        headers: { 'Content-Type': 'application/json' },
      })
      .subscribe({
        next: (res: any) => {
          console.log('Login response:', res);
          const token = res?.result?.token || res?.result?.accessToken || res?.token;
          if (res?.result?.authenticated && token) {
            // Lưu token mới
            localStorage.setItem('access_token', token);
            this.saveProfileAndRedirect();
          } else {
            this.errorMessage =
              res?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.';
            // alert(this.errorMessage);
            this.notificationService.show('error', this.errorMessage);
          }
        },
        error: (err) => {
          console.error('Lỗi đăng nhập:', err);
          this.errorMessage =
            err?.error?.message || 'Yêu cầu đăng nhập thất bại. Vui lòng thử lại sau.';
          // alert(this.errorMessage);
          this.notificationService.show('error', this.errorMessage);
        },
      });
  }

  // Điều hướng sang trang đăng ký
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  // Mở modal quên mật khẩu
  openForgotPasswordModal(event: Event) {
    event.preventDefault();
    this.showForgotPasswordModal = true;
  }

  // Đóng modal
  closeForgotPasswordModal() {
    this.showForgotPasswordModal = false;
  }
  closeOtpModal() {
    this.showOtpModal = false;
  }

  // Gửi email quên mật khẩu
  onForgotPassword() {
    if (!this.forgotUsername) {
      this.forgotMessage = 'Vui lòng nhập username.';
      return;
    }
    if (!this.forgotEmail) {
      this.forgotMessage = 'Vui lòng nhập email.';
      return;
    }

    if (this.isSending) return;
    this.isSending = true;
    this.forgotMessage = '';

    this.http
      .post(
        `auth/forgot-password?email=${encodeURIComponent(this.forgotEmail)}&username=${encodeURIComponent(this.forgotUsername)}`,
        {}
      )
      .subscribe({
        next: () => {
          this.isSending = false;
          this.showForgotPasswordModal = false;
          this.showOtpModal = true;
        },
        error: (err) => {
          this.isSending = false;
          this.forgotMessage = err?.error?.message || 'Không thể gửi yêu cầu. Vui lòng thử lại.';
        },
      });
  }

  // Xác thực mã OTP
  onVerifyOtp() {
    if (!this.otpCode) {
      this.otpMessage = 'Vui lòng nhập mã OTP.';
      return;
    }

    this.http
      .post(
        `auth/verify-code?email=${encodeURIComponent(this.forgotEmail)}&token=${encodeURIComponent(this.otpCode)}`,
        {}
      )
      .subscribe({
        next: () => {
          this.otpMessage = 'Xác nhận thành công! Giờ bạn có thể đặt lại mật khẩu.';
          this.showOtpModal = false;
          this.showResetPasswordModal = true;
        },
        error: (err) => {
          this.otpMessage = err?.error?.message || 'Mã OTP không hợp lệ.';
        },
      });
  }

  // Đặt lại mật khẩu
  onResetPassword() {
    if (!this.newPassword) {
      this.resetMessage = 'Vui lòng nhập mật khẩu mới.';
      return;
    }

    this.http
      .post(
        `auth/reset-password?email=${encodeURIComponent(this.forgotEmail)}&newPassword=${encodeURIComponent(this.newPassword)}`,
        {}
      )
      .subscribe({
        next: () => {
          this.resetMessage = 'Đặt lại mật khẩu thành công!';
          setTimeout(() => {
            this.showResetPasswordModal = false;
            this.newPassword = '';
          }, 1500);
        },
        error: (err) => {
          this.resetMessage = err?.error?.message || 'Đặt lại mật khẩu thất bại.';
        },
      });
  }
}
