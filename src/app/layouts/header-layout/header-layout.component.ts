import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '@/app/core/services/auth.service';

@Component({
  selector: 'header-layout',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './header-layout.component.html',
  styleUrls: ['./header-layout.component.css'],
})
export class HeaderLayoutComponent implements OnDestroy {
  isLoggedIn = false;
  showAccountDropdown = false;
  isAdmin = false;
  hideOnAuthPages = false;

  private readonly isBrowser: boolean;
  private routerSub: Subscription | null = null;
  private storageHandler: ((this: Window, ev: StorageEvent) => any) | null = null;

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);

    if (!this.isBrowser) {
      return;
    }

    this.checkLogin();
    this.updateVisibility(this.router.url);

    this.storageHandler = () => this.checkLogin();
    window.addEventListener('storage', this.storageHandler);

    this.routerSub = this.router.events.subscribe((ev) => {
      if (ev instanceof NavigationEnd) {
        this.checkLogin();
        this.showAccountDropdown = false;
        this.updateVisibility(ev.urlAfterRedirects || ev.url);
      }
    });
  }

  private updateVisibility(url: string) {
    const path = (url || '').split('?')[0].replace(/#.*$/, '');
    this.hideOnAuthPages = path === '/login' || path === '/register';
  }

  private checkLogin() {
    this.isLoggedIn = !!this.authService.getToken();
    try {
      const raw = localStorage.getItem('user_profile');
      if (!raw) {
        this.isAdmin = false;
        return;
      }
      const profile = JSON.parse(raw);
      const roles = profile?.roles ?? profile?.result?.roles ?? profile?.user?.roles ?? [];
      this.isAdmin =
        Array.isArray(roles) &&
        roles.some((r: any) => {
          const code = (r?.code || r?.name || '').toString().toUpperCase();
          return code === 'ADMIN';
        });
    } catch {
      this.isAdmin = false;
    }
  }

  toggleDropdown() {
    this.showAccountDropdown = !this.showAccountDropdown;
  }

  logout() {
    if (!this.isBrowser) {
      return;
    }
    this.authService.logout();
    this.showAccountDropdown = false;
    this.checkLogin();
    this.router.navigate(['/login']);
  }

  ngOnDestroy(): void {
    if (this.routerSub) {
      this.routerSub.unsubscribe();
      this.routerSub = null;
    }
    if (this.storageHandler) {
      window.removeEventListener('storage', this.storageHandler);
      this.storageHandler = null;
    }
  }
}
