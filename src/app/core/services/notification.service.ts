import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private _visible = new BehaviorSubject<boolean>(false);
  private _message = new BehaviorSubject<string>('');
  private _type = new BehaviorSubject<NotificationType>('info');
  
  // Nơi lưu trữ ID của timeout hiện tại
  private currentTimeoutId: any = null;

  visible$ = this._visible.asObservable();
  message$ = this._message.asObservable();
  type$ = this._type.asObservable();

  show(type: NotificationType, message: string, duration: number = 3000) {
    // Nếu có một thông báo cũ đang đợi để ẩn, hủy lệnh hẹn giờ đó đi
    if (this.currentTimeoutId) {
      clearTimeout(this.currentTimeoutId);
    }

    this._type.next(type);
    this._message.next(message);
    this._visible.next(true);

    if (duration > 0) {
      // Lưu lại ID của timeout mới
      this.currentTimeoutId = setTimeout(() => {
        this.hide();
      }, duration);
    }
  }

  hide() {
    this._visible.next(false);
    this.currentTimeoutId = null; // Xóa log ID sau khi đã ẩn
  }
}