import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '@/environments/environment';

export const customInterceptor: HttpInterceptorFn = (req, next) => {
  let token: string | null = null;

  const isAbsoluteUrl = /^https?:\/\//i.test(req.url);
  const isAssetUrl = req.url.startsWith('assets/') || req.url.startsWith('/assets/');

  if (!isAbsoluteUrl && !isAssetUrl) {
    const normalizedUrl = req.url.startsWith('/') ? req.url.slice(1) : req.url;
    req = req.clone({
      url: `${environment.apiUrl}/${normalizedUrl}`,
    });
  }

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    token = localStorage.getItem('access_token');
  }

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  return next(req);
};
