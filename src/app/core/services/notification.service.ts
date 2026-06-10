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

  // Observable cho component lắng nghe
  visible$ = this._visible.asObservable();
  message$ = this._message.asObservable();
  type$ = this._type.asObservable();

  show(type: NotificationType, message: string, duration: number = 3000) {
    this._type.next(type);
    this._message.next(message);
    this._visible.next(true);

    // Ẩn sau duration ms
    if (duration > 0) {
      setTimeout(() => this.hide(), duration);
    }
  }

  hide() {
    this._visible.next(false);
  }
}
