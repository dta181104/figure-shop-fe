import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling  } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { customInterceptor } from '@/app/core/interceptor/custom.interceptor';
import { importProvidersFrom } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { en_US, provideNzI18n } from 'ng-zorro-antd/i18n';
import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

registerLocaleData(en);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withInMemoryScrolling({
      scrollPositionRestoration: 'top'
    })),
    provideClientHydration(withEventReplay()),
    provideHttpClient(
      withFetch(),
      withInterceptors([customInterceptor]) // gộp fetch + interceptor
    ),
    importProvidersFrom(FormsModule, ReactiveFormsModule),
    provideNzI18n(en_US),
    importProvidersFrom(FormsModule),
    provideAnimationsAsync(),
  ],
};
