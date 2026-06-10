import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, NotificationType } from '@/app/core/services/notification.service';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification.component.html',
  styleUrls: ['./notification.component.css'],
})
export class NotificationComponent implements OnInit, OnDestroy {
  visible = false;
  message = '';
  type: NotificationType = 'info';
  private sub = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.sub.add(this.notificationService.visible$.subscribe((v) => (this.visible = v)));
    this.sub.add(this.notificationService.message$.subscribe((m) => (this.message = m)));
    this.sub.add(this.notificationService.type$.subscribe((t) => (this.type = t)));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
